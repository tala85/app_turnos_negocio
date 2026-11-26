import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { verificarSuperAdmin } from "@/lib/super-admin-auth";
import { generarMagicToken } from "@/lib/auth-token";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 🔒 1. Blindaje: solo el Super Admin puede llamar a este endpoint
  const esSuperAdmin = await verificarSuperAdmin();
  if (!esSuperAdmin) {
    return NextResponse.json(
      { ok: false, mensaje: "No autorizado" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;

    // 2. Buscamos el estudio para obtener su slug (necesario para armar el link)
    const { data: estudio, error } = await adminDb
      .from("estudios")
      .select("id, slug, email")
      .eq("id", id)
      .single();

    if (error || !estudio) {
      return NextResponse.json(
        { ok: false, mensaje: "Estudio no encontrado" },
        { status: 404 },
      );
    }

    // 3. Generamos el token mágico de 15 minutos (el mismo que usa el email)
    const token = await generarMagicToken(estudio.id, 15);

    // 4. Armamos la URL absoluta para que el Super Admin la pueda copiar
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const linkUrgente = `${appUrl}/${estudio.slug}/admin/login/verify?token=${token}`;

    return NextResponse.json({
      ok: true,
      link: linkUrgente,
      email: estudio.email, // Para mostrarle al Super Admin a dónde debería haber llegado
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error interno";
    console.error("[acceso-urgente]", mensaje);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
