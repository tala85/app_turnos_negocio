import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generarToken } from "@/lib/auth-token";
import { obtenerEstudioPorSlug } from "@/lib/estudios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, slug } = body; // ← Ahora esperamos que el frontend mande el slug

    const passwordCorrecta = process.env.ADMIN_PASSWORD || "admin123";
    if (password !== passwordCorrecta) {
      return NextResponse.json(
        { ok: false, mensaje: "Contraseña incorrecta" },
        { status: 401 },
      );
    }

    // Buscamos el estudio por el slug que viene del frontend
    const estudio = await obtenerEstudioPorSlug(slug);
    if (!estudio) {
      return NextResponse.json(
        { ok: false, mensaje: "Estudio no encontrado" },
        { status: 404 },
      );
    }

    const token = await generarToken(estudio.id); // ← ID real, sin fallback hardcodeado

    const cookieStore = await cookies();
    cookieStore.set("admin_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error interno";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
