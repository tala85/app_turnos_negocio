import { NextRequest, NextResponse } from "next/server";
import { verificarSuperAdmin } from "@/lib/super-admin-auth";
import { adminDb } from "@/lib/supabase/admin";

// ✅ GET: Leer la configuración actual
export async function GET() {
  const { data } = await adminDb
    .from("plataforma_config")
    .select("*")
    .eq("id", "global")
    .single();

  return NextResponse.json({ ok: true, data });
}

// ✅ PUT: Guardar nuevos defaults (PROTEGIDO: solo Super Admin)
export async function PUT(req: NextRequest) {
  const esSuperAdmin = await verificarSuperAdmin();
  if (!esSuperAdmin) {
    return NextResponse.json({ ok: false, mensaje: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      slogan_default, color_primario, color_secundario, color_fondo,
      sena_porcentaje, minutos_bloqueo, paso_minutos,
      horario_inicio, horario_fin, dias_atencion 
    } = body;

    const { error } = await adminDb
      .from("plataforma_config")
      .update({
        slogan_default,
        color_primario,
        color_secundario,
        color_fondo,
        sena_porcentaje: Number(sena_porcentaje),
        minutos_bloqueo: Number(minutos_bloqueo),
        paso_minutos: Number(paso_minutos),
        horario_inicio,
        horario_fin,
        dias_atencion,
      })
      .eq("id", "global");

    if (error) throw error;

    return NextResponse.json({ ok: true, mensaje: "Configuración guardada" });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error interno";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}