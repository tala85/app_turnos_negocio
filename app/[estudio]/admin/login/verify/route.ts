import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarMagicToken, generarToken } from "@/lib/auth-token";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  const sesion = await verificarMagicToken(token ?? undefined);

  if (!sesion) {
    // Link vencido/adulterado → volvemos al login per-estudio con aviso.
    //    Reconstruimos el slug desde el pathname: /{slug}/admin/login/verify
    const partes = req.nextUrl.pathname.split("/");
    const slug = partes[1] ?? "";
    const url = req.nextUrl.clone();
    url.pathname = `/${slug}/admin/login`;
    url.search = "?error=link_invalido";
    return NextResponse.redirect(url);
  }

  // El magic token es solo la llave temporal → recién ahora creamos la sesión 24h
  const tokenSesion = await generarToken(sesion.estudioId);

  const cookieStore = await cookies();
  cookieStore.set("admin_auth", tokenSesion, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.redirect(new URL("/admin/reservas", req.url));
}
