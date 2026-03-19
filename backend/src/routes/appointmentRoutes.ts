import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.query;

    // Console log fondamentale: controlla cosa arriva quando carichi la pagina da admin
    console.log("DEBUG BACKEND - ID:", userId, "RUOLO:", role);

    let query = supabase
      .from('bookings')
      .select(`
        *,
        services:service_id (name, duration),
        customers:customer_id (first_name, last_name, phone)
      `)
      .order('booking_datetime', { ascending: true });

    // Trasformiamo il ruolo in minuscolo per evitare errori (es. "Admin" vs "admin")
    const userRole = role?.toString().toLowerCase();

    // Applichiamo il filtro SOLO se l'utente NON è admin
    if (userRole !== 'admin') {
      if (userId) {
        query = query.eq('customer_id', userId);
      } else {
        // Se non è admin e non c'è ID, restituiamo vuoto per sicurezza
        return res.json([]);
      }
    }

    // Se è admin, il codice salta il blocco 'if' e la query rimane senza filtri (vede tutto)
    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Errore nel recupero delle prenotazioni' });
  }
});

/**
 * POST /bookings
 * Crea una nuova prenotazione con controllo preventivo di disponibilità.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer_id, service_id, booking_datetime, status } = req.body;

    // 1. Verifica esistenza cliente (Uso admin per bypassare eventuali RLS restrittive in fase di creazione)
    const { data: customerExists } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('id', customer_id)
      .maybeSingle();

    if (!customerExists) {
      return res.status(404).json({ error: 'Cliente non registrato.' });
    }

    // 2. Controllo conflitti (Buffer di 15 minuti)
    const targetTime = new Date(booking_datetime).getTime();
    const buffer = 15 * 60 * 1000;

    const { data: conflict } = await supabase
      .from('bookings')
      .select('id')
      .gte('booking_datetime', new Date(targetTime - buffer).toISOString())
      .lte('booking_datetime', new Date(targetTime + buffer).toISOString())
      .limit(1);

    if (conflict && conflict.length > 0) {
      return res.status(409).json({ error: 'L\'orario selezionato non è disponibile (minimo 15min di intervallo).' });
    }

    // 3. Inserimento
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([{ customer_id, service_id, booking_datetime, status: status || 'confirmed' }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Impossibile processare la prenotazione.' });
  }
});

/**
 * PATCH /bookings/:id
 * Aggiorna una prenotazione esistente.
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { booking_datetime } = req.body;

    // Se l'utente sta cambiando orario, verifichiamo che non ci siano sovrapposizioni
    if (booking_datetime) {
      const target = new Date(booking_datetime).getTime();
      const { data: conflict } = await supabase
        .from('bookings')
        .select('id')
        .gte('booking_datetime', new Date(target - 500).toISOString())
        .lte('booking_datetime', new Date(target + 500).toISOString())
        .neq('id', id) // Escludiamo la prenotazione stessa dal controllo
        .limit(1);

      if (conflict && conflict.length > 0) {
        return res.status(409).json({ error: 'Orario occupato da un altra prenotazione.' });
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento.' });
  }
});

/**
 * DELETE /bookings/:id
 * Rimuove una prenotazione.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: 'Errore durante la cancellazione.' });
  }
});

export default router;