import { cookies } from "next/headers";

export async function verificarAdmin() {
  // ✅ Agregamos 'await' porque en Next.js 15 cookies() es una promesa
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_auth");

  if (!adminCookie || adminCookie.value !== "true") {
    return false;
  }
  return true;
}
