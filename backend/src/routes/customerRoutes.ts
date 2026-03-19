import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * GET /customers
 * Lista clienti ordinata per cognome.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Errore nel caricamento dei clienti" });
  }
});

/**
 * POST /customers
 * Crea un nuovo contatto cliente.
 */
router.post('/', async (req: Request, res: Response) => {
  const { first_name, last_name, email, phone, notes } = req.body;

  // Una piccola validazione manuale fa molto "Junior attento"
  if (!first_name || !last_name) {
    return res.status(400).json({ error: "Nome e cognome sono obbligatori" });
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([{ first_name, last_name, email, phone, notes }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Errore durante il salvataggio del cliente" });
  }
});

/**
 * PATCH /customers/:id
 * Aggiornamento parziale. Ho cambiato da PUT a PATCH perché solitamente 
 * nei gestionali si aggiornano solo alcuni campi, non tutto l'oggetto.
 */
router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Filtriamo i dati per evitare che passino campi non voluti (es. l'id stesso)
    const { first_name, last_name, email, phone, notes } = req.body;
    const updateData = { first_name, last_name, email, phone, notes };

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Impossibile aggiornare il profilo cliente" });
  }
});

/**
 * DELETE /customers/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: "Errore durante l'eliminazione" });
  }
});

export default router;