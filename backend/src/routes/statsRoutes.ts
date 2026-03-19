import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * GET /stats/overview
 * Recupera i conteggi principali per la dashboard in un'unica chiamata.
 * Più efficiente per il frontend e più pulito da vedere.
 */
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    // Usiamo Promise.all per eseguire le query in parallelo (Performance!)
    const [bookingsRes, customersRes] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true })
    ]);

    if (bookingsRes.error) throw bookingsRes.error;
    if (customersRes.error) throw customersRes.error;

    res.json({
      appointments: bookingsRes.count || 0,
      customers: customersRes.count || 0,
      updatedAt: new Date().toISOString() // Un tocco di classe per il frontend
    });
  } catch (error) {
    res.status(500).json({ error: "Errore nel caricamento delle statistiche" });
  }
});

/**
 * Se preferisci mantenere i singoli endpoint per motivi specifici, 
 * ecco come renderli più professionali:
 */

router.get('/appointments/count', async (_req: Request, res: Response) => {
  try {
    const { count, error } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (error) {
    res.status(500).json({ error: "Errore conteggio appuntamenti" });
  }
});

router.get('/customers/count', async (_req: Request, res: Response) => {
  try {
    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (error) {
    res.status(500).json({ error: "Errore conteggio clienti" });
  }
});

export default router;