import { redirect } from 'next/navigation';
import { obtenerEstudioDeSesion } from '@/lib/auth';
import { adminDb } from '@/lib/supabase/admin';

export default async function AdminHome() {
  // 1. Leemos el estudio de la cookie de sesión (no de la URL)
  const estudioId = await obtenerEstudioDeSesion();

  // 2. Si no hay sesión, mandamos a la plataforma pública
  if (!estudioId) redirect('/plataforma');

  // 3. Buscamos el slug de este estudio
  const { data } = await adminDb
    .from('estudios')
    .select('slug')
    .eq('id', estudioId)
    .single();

  // 4. Redirigimos a la vitrina de TU estudio (ej: /belleza-posadas)
  redirect(`/${data?.slug ?? ''}`);
}