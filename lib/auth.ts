import { cookies } from 'next/headers';
import { verificarToken } from '@/lib/auth-token';

export async function verificarAdmin() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_auth');
  return verificarToken(adminCookie?.value);
}