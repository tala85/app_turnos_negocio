import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generarToken } from "@/lib/auth-token";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;
    console.log("🔐 Password recibida:", password);
    console.log("🔐 Password esperada:", process.env.ADMIN_PASSWORD);
    console.log("🔐 Coinciden:", password === process.env.ADMIN_PASSWORD);

    // ✅ La contraseña se compara en el servidor, NO en el cliente
    const passwordCorrecta = process.env.ADMIN_PASSWORD || "admin123";

    if (password !== passwordCorrecta) {
      return NextResponse.json(
        { ok: false, mensaje: "Contraseña incorrecta" },
        { status: 401 },
      );
    }

    // ✅ Cookie httpOnly: JavaScript NO puede leerla ni modificarla
    const token = await generarToken();
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
