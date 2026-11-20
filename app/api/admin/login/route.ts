import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generarToken } from "@/lib/auth-token";
import { obtenerEstudioPorSlug } from "@/lib/estudios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    const passwordCorrecta = process.env.ADMIN_PASSWORD || "admin123";
    if (password !== passwordCorrecta) {
      return NextResponse.json(
        { ok: false, mensaje: "Contraseña incorrecta" },
        { status: 401 },
      );
    }

    // Puente temporal: el login viejo emite token del estudio default
    const estudio = await obtenerEstudioPorSlug("belleza-posadas");
    const token = await generarToken(
      estudio?.id ?? "2441c401-ae11-4037-ab80-4725c0304840",
    );

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
