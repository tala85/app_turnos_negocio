import { cookies } from "next/headers";
import { verificarToken } from "@/lib/auth-token";

// ✅ True si hay sesión válida (y, si se pide, del estudio esperado)
export async function verificarAdmin(
  estudioEsperado?: string,
): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_auth");
  const sesion = await verificarToken(adminCookie?.value);
  if (!sesion) return false;
  if (estudioEsperado && sesion.estudioId !== estudioEsperado) return false;
  return true;
}

// ✅ Devuelve el estudio_id de la sesión actual (o null)
export async function obtenerEstudioDeSesion(): Promise<string | null> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_auth");
  const sesion = await verificarToken(adminCookie?.value);
  return sesion?.estudioId ?? null;
}
