import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Validazione centralizzata delle variabili d'ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('[Config] Missing Supabase environment variables. check your .env file.');
}

/*
 * Client standard per operazioni lato client (se necessario)
 * o operazioni che rispettano le RLS (Row Level Security).
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/*
 * Client Admin da usare esclusivamente lato server per bypassare le RLS.
 * Usalo con cautela solo in funzioni protette o job di sistema.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);