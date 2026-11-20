import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { obtenerEstudioDeSesion } from "@/lib/auth";

const noAutorizado = () =>
  NextResponse.json({ ok: false, mensaje: "No autorizado" }, { status: 401 });

export async function GET() {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    const [horarios, excepciones] = await Promise.all([
      adminDb
        .from("horarios_trabajo")
        .select("*")
        .eq("estudio_id", estudioId) // ← de la sesión
        .eq("activo", true)
        .order("dia_semana"),
      adminDb
        .from("horarios_excepciones")
        .select("*")
        .eq("estudio_id", estudioId) // ← de la sesión
        .order("fecha"),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        horarios: horarios.data || [],
        excepciones: excepciones.data || [],
      },
    });
  } catch (e: unknown) {
    const mensaje =
      e instanceof Error ? e.message : "Error al obtener horarios";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    const body = await req.json();
    const { tipo, datos } = body;

    if (!tipo || !datos) {
      return NextResponse.json(
        { ok: false, mensaje: "Faltan datos" },
        { status: 400 },
      );
    }

    if (tipo === "horario") {
      const { data, error } = await adminDb
        .from("horarios_trabajo")
        .insert({
          estudio_id: estudioId, // ← de la sesión, NUNCA del body
          dia_semana: datos.dia_semana,
          hora_inicio: datos.hora_inicio,
          hora_fin: datos.hora_fin,
          activo: true,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, data });
    } else if (tipo === "excepcion") {
      const { data, error } = await adminDb
        .from("horarios_excepciones")
        .insert({
          estudio_id: estudioId, // ← de la sesión
          fecha: datos.fecha,
          hora_inicio: datos.hora_inicio,
          hora_fin: datos.hora_fin,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json(
      { ok: false, mensaje: "Tipo inválido" },
      { status: 400 },
    );
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al guardar";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  const id = req.nextUrl.searchParams.get("id");
  const tipo = req.nextUrl.searchParams.get("tipo");

  if (!id || !tipo) {
    return NextResponse.json(
      { ok: false, mensaje: "Faltan datos" },
      { status: 400 },
    );
  }

  try {
    const tabla =
      tipo === "horario" ? "horarios_trabajo" : "horarios_excepciones";

    // Doble filtro: solo toca filas de ESTE estudio
    const { data, error } = await adminDb
      .from(tabla)
      .delete()
      .eq("id", id)
      .eq("estudio_id", estudioId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json(
        { ok: false, mensaje: "No encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al eliminar";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
