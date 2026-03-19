import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * GET /services
 * Elenco di tutti i servizi offerti (es. Taglio, Barba, etc.)
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("ERRORE DETTAGLIATO:", error);res.status(500).json({ error: "Impossibile recuperare i servizi." });
  }
});

/**
 * POST /services
 * Crea un nuovo servizio verificando i campi obbligatori.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration } = req.body;

    if (!name || price === undefined || duration === undefined) {
      return res.status(400).json({ error: "Nome, prezzo e durata sono obbligatori." });
    }

    const { data, error } = await supabase
      .from('services')
      .insert([{ 
        name, 
        description, 
        price: Number(price), 
        duration: Number(duration) 
      }])
      .select()
      .single(); // Più pulito di data[0]

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Errore durante la creazione del servizio." });
  }
});

/**
 * PATCH /services/:id
 * Aggiornamento parziale del servizio.
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;

    // Costruiamo l'oggetto update solo con i campi presenti nel body
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (duration !== undefined) updateData.duration = Number(duration);

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Servizio non trovato." });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Errore durante l'aggiornamento del servizio." });
  }
});

/**
 * DELETE /services/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ error: "Errore durante l'eliminazione del servizio." });
  }
});

export default router;