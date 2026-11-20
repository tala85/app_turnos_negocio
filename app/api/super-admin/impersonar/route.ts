import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarSuperAdmin } from "@/lib/super-admin-auth";
import { generarToken } from "@/lib/auth-token";
import { obtenerEstudioPorId } from "@/lib/estudios";

export async function POST(req: NextRequest) {
  // ✅ CRÍTICO: verifica SUPER ADMIN, no estudio.
  //    Si usáramos verificarAdmin(), cualquier usuario podría
  //    pedir tokens de otros estudios. Solo la llave maestra puede impersonar.
  const esSuperAdmin = await verificarSuperAdmin();
  if (!esSuperAdmin) {
    return NextResponse.json(
      { ok: false, mensaje: "No autorizado" },
      { status: 401 },
    );
  }

  try {
    const { estudioId } = await req.json();
    if (!estudioId) {
      return NextResponse.json(
        { ok: false, mensaje: "Falta estudioId" },
        { status: 400 },
      );
    }

    // Verificar que el estudio exista antes de emitir el token
    const estudio = await obtenerEstudioPorId(estudioId);
    if (!estudio) {
      return NextResponse.json(
        { ok: false, mensaje: "Estudio no encontrado" },
        { status: 404 },
      );
    }

    // ✅ Generar token de sesión del estudio elegido (firma HMAC con estudioId)
    const token = await generarToken(estudio.id);
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30, // 30 minutos: sesión de soporte corta y segura
    });

    cookieStore.set("modo_soporte", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30, // 30 min, igual que la sesión de soporte
    });

    return NextResponse.json({ ok: true, nombre: estudio.nombre });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error interno";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
