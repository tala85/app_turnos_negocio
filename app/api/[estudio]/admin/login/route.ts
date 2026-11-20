import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generarToken } from "@/lib/auth-token";
import { obtenerEstudioPorSlug, verificarPassword } from "@/lib/estudios";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ estudio: string }> },
) {
  const { estudio: slug } = await params;

  try {
    const body = await req.json();
    const { password } = body;

    const estudio = await obtenerEstudioPorSlug(slug);
    if (!estudio) {
      return NextResponse.json(
        { ok: false, mensaje: "Estudio no encontrado" },
        { status: 404 },
      );
    }

    // ✅ Compara contra el hash bcrypt del estudio. Sin console.log de contraseñas.
    if (!verificarPassword(estudio.admin_password_hash, password)) {
      return NextResponse.json(
        { ok: false, mensaje: "Contraseña incorrecta" },
        { status: 401 },
      );
    }

    const token = await generarToken(estudio.id);
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ ok: true, estudioId: estudio.id });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error interno";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
