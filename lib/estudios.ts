import bcrypt from 'bcryptjs';
import { adminDb } from '@/lib/supabase/admin';

export type Estudio = {
  id: string;
  slug: string;
  nombre: string;
  logo_url: string | null;
  color_primario: string;
  color_secundario: string;
  color_fondo: string;
  whatsapp: string | null;
  direccion: string | null;
  instagram: string | null;
  facebook: string | null;
  admin_password_hash: string | null;
};

export async function obtenerEstudioPorSlug(slug: string): Promise<Estudio | null> {
  const { data, error } = await adminDb
    .from('estudios')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data as Estudio;
}

export async function obtenerEstudioPorId(id: string): Promise<Estudio | null> {
  const { data, error } = await adminDb
    .from('estudios')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Estudio;
}

export function hashearPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verificarPassword(hash: string | null, password: string): boolean {
  if (!hash) return false;
  return bcrypt.compareSync(password, hash);
}

export async function setearPasswordEstudio(estudioId: string, password: string): Promise<void> {
  const hash = hashearPassword(password);
  const { error } = await adminDb
    .from('estudios')
    .update({ admin_password_hash: hash })
    .eq('id', estudioId);
  if (error) throw error;
}