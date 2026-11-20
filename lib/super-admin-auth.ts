import { cookies } from "next/headers";

const COOKIE_NAME = "super_admin_auth";
const MAX_AGE = 60 * 60 * 24; // 24 horas

// ✅ Verifica si hay sesión de Super Admin activa
export async function verificarSuperAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return false;

  // Comparamos con la contraseña maestra (simple pero efectivo para empezar)
  return cookie.value === process.env.SUPER_ADMIN_PASSWORD;
}

// ✅ Crea la cookie de Super Admin
export async function crearSesionSuperAdmin(
  password: string,
): Promise<boolean> {
  if (password !== process.env.SUPER_ADMIN_PASSWORD) return false;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

// ✅ Cierra la sesión de Super Admin
export async function cerrarSesionSuperAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete('modo_soporte');
}

// ✅ Verifica si hay una IMPERSONACIÓN activa (no solo sesión super admin)
export async function verificarModoSoporte(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("modo_soporte")?.value === "1";
}
