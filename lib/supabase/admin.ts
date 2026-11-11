// Este archivo SOLO se ejecuta en el servidor (API Routes, Server Components).
// Usa la service_role key que tiene permisos totales.
// Por eso NO empieza con NEXT_PUBLIC_ (no se expone al navegador).
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const adminDb = createClient(supabaseUrl, supabaseServiceKey);
export const adminStorage = createClient(supabaseUrl, supabaseServiceKey).storage;