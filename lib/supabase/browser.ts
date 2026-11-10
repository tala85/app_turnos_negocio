// Este archivo se ejecuta en el navegador del cliente.
// Usa la anon key (public) que solo puede leer datos públicos.
// Empieza con NEXT_PUBLIC_ porque el navegador la necesita.

import { createBrowserClient } from '@supabase/ssr';

export const db = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );