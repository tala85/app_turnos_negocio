import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { obtenerEstudioDeSesion } from "@/lib/auth";

const noAutorizado = () =>
  NextResponse.json({ ok: false, mensaje: "No autorizado" }, { status: 401 });

// ═══════════════════════════════════════════════
// GET: listar campañas del estudio (desde sesión)
// ═══════════════════════════════════════════════
export async function GET() {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    const { data: campanas, error } = await adminDb
      .from("campanas")
      .select("*, combos(nombre), servicios(nombre)")
      .eq("estudio_id", estudioId)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, campanas: campanas || [] });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al listar";
    console.error("[campanas GET]", e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════
// POST: crear campaña (estudio desde sesión)
// ═══════════════════════════════════════════════
export async function POST(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    const body = await req.json();
    const {
      titulo,
      descripcion,
      imagen_url,
      tipo,
      combo_id,
      servicio_id,
      fecha_inicio,
      fecha_fin,
      fechas_especificas,
      cupos,
      precio_especial,
      activa,
    } = body;

    if (!titulo || !tipo || !fecha_inicio || !fecha_fin) {
      return NextResponse.json(
        { ok: false, mensaje: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    // Validación de fechas según modo
    if (fechas_especificas && fechas_especificas.length > 0) {
      // modo días puntuales: no exige rango
    } else if (new Date(fecha_fin) < new Date(fecha_inicio)) {
      return NextResponse.json(
        {
          ok: false,
          mensaje: "La fecha fin debe ser posterior a la fecha inicio",
        },
        { status: 400 },
      );
    }

    if (combo_id && servicio_id) {
      return NextResponse.json(
        {
          ok: false,
          mensaje: "La campaña puede vincular un combo O un servicio, no ambos",
        },
        { status: 400 },
      );
    }

    const { data, error } = await adminDb
      .from("campanas")
      .insert({
        estudio_id: estudioId, // ← de la sesión, NUNCA del body
        titulo,
        descripcion: descripcion || null,
        imagen_url: imagen_url || null,
        tipo,
        combo_id: combo_id || null,
        servicio_id: servicio_id || null,
        fecha_inicio,
        fecha_fin,
        fechas_especificas: fechas_especificas?.length
          ? fechas_especificas
          : null,
        cupos: cupos || null,
        precio_especial: precio_especial || null,
        activa: activa !== false,
        orden: body.orden || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, campana: data });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al crear";
    console.error("[campanas POST]", e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════
// PATCH: actualizar campaña (doble filtro)
// ═══════════════════════════════════════════════
export async function PATCH(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, mensaje: "Falta id de la campaña" },
        { status: 400 },
      );
    }

    if (updates.fecha_inicio || updates.fecha_fin) {
      const inicio = updates.fecha_inicio || updates.fecha_fin;
      const fin = updates.fecha_fin || updates.fecha_inicio;
      if (new Date(fin) < new Date(inicio)) {
        return NextResponse.json(
          {
            ok: false,
            mensaje: "La fecha fin debe ser posterior a la fecha inicio",
          },
          { status: 400 },
        );
      }
    }

    const { data, error } = await adminDb
      .from("campanas")
      .update(updates)
      .eq("id", id)
      .eq("estudio_id", estudioId) // ← doble filtro
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json(
        { ok: false, mensaje: "No encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, campana: data[0] });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al actualizar";
    console.error("[campanas PATCH]", e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════
// DELETE: borrar campaña (doble filtro)
// ═══════════════════════════════════════════════
export async function DELETE(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { ok: false, mensaje: "Falta id de la campaña" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await adminDb
      .from("campanas")
      .delete()
      .eq("id", id)
      .eq("estudio_id", estudioId) // ← doble filtro
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
    const mensaje = e instanceof Error ? e.message : "Error al borrar";
    console.error("[campanas DELETE]", e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
