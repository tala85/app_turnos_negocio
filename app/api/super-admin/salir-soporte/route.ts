import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  // ✅ Solo borramos la sesión del estudio; la de Super Admin sigue viva
  cookieStore.delete("admin_auth");
  cookieStore.delete("modo_soporte");
  return NextResponse.json({ ok: true });
}
