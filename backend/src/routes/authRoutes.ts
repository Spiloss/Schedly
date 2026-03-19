import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * POST /auth/signup
 * Registra un nuovo utente su Supabase Auth e sincronizza i dati nelle tabelle del DB.
 */
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, first_name, last_name, phone } = req.body;

  try {
    // 1. Creazione utente in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return res.status(400).json({ error: authError.message });
    if (!authData.user) return res.status(500).json({ error: "Errore durante la creazione dell'account." });

    const userId = authData.user.id;
    const fullName = `${first_name} ${last_name}`.trim();

    // 2. Sincronizzazione tabelle (Usiamo Promise.all per essere più efficienti e "senior")
    const [custResult, userResult] = await Promise.all([
      supabaseAdmin.from('customers').upsert([{ 
        id: userId, 
        first_name, 
        last_name, 
        email, 
        phone 
      }]),
      supabaseAdmin.from('users').upsert([{ 
        id: userId, 
        email,
        name: fullName, 
        role: 'user' 
      }])
    ]);

    if (custResult.error || userResult.error) {
      // Nota: In un sistema reale qui potresti voler cancellare l'utente auth appena creato (rollback)
      return res.status(500).json({ error: "Errore nella creazione del profilo utente." });
    }
    
    res.status(201).json({ message: "Registrazione completata con successo!" });

  } catch (err) {
    res.status(500).json({ error: "Errore interno del server durante il signup." });
  }
});

/**
 * POST /auth/login
 * Effettua il login e restituisce sessione e dati profilo (ruolo e nome).
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: "Credenziali non valide." });

    // Recupero informazioni aggiuntive dal nostro DB
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ error: "Errore nel caricamento del profilo." });
    }

    res.status(200).json({ 
      session: data.session, 
      user: {
        ...data.user,
        role: userProfile?.role || 'user',
        full_name: userProfile?.name
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Errore interno durante il login." });
  }
});

export default router;