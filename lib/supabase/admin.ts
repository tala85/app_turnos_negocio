// Este archivo SOLO se ejecuta en el servidor (API Routes, Server Components).
// Usa la service_role key que tiene permisos totales.
// Por eso NO empieza con NEXT_PUBLIC_ (no se expone al navegador).

import 'server-only';
import { createClient } from '@supabase/supabase-js';

export const adminDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,        // no guarda sesión (es servidor)
      autoRefreshToken: false,      // no renueva tokens
    },
  }
);