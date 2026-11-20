import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { obtenerEstudioDeSesion } from "@/lib/auth";

const noAutorizado = () =>
  NextResponse.json({ ok: false, mensaje: "No autorizado" }, { status: 401 });

export async function GET() {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    // ✅ Lista TODOS los combos del estudio (activos e inactivos) para poder gestionarlos
    const { data, error } = await adminDb
      .from("combos")
      .select("*, combo_servicios(servicio_id)")
      .eq("estudio_id", estudioId)
      .order("nombre");

    if (error) throw error;
    return NextResponse.json({ ok: true, data: data || [] });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al obtener combos";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    const body = await req.json();
    const {
      nombre,
      descripcion,
      precio_oferta,
      servicio_ids,
      activo = true,
    } = body;

    if (
      !nombre ||
      !precio_oferta ||
      !servicio_ids ||
      servicio_ids.length === 0
    ) {
      return NextResponse.json(
        { ok: false, mensaje: "Faltan datos requeridos" },
        { status: 400 },
      );
    }

    const { data: comboData, error: comboError } = await adminDb
      .from("combos")
      .insert({
        estudio_id: estudioId, // ← de la sesión, NUNCA del body
        nombre,
        descripcion: descripcion || null,
        precio_oferta,
        activo,
      })
      .select()
      .single();

    if (comboError) throw comboError;

    if (servicio_ids.length > 0) {
      const relaciones = servicio_ids.map((servicioId: string) => ({
        combo_id: comboData.id,
        servicio_id: servicioId,
      }));
      const { error: relError } = await adminDb
        .from("combo_servicios")
        .insert(relaciones);
      if (relError) throw relError;
    }

    return NextResponse.json({ ok: true, data: comboData });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al crear combo";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    const body = await req.json();
    const { id, nombre, descripcion, precio_oferta, servicio_ids, activo } =
      body;

    if (!id)
      return NextResponse.json(
        { ok: false, mensaje: "Falta id del combo" },
        { status: 400 },
      );

    const updateData: Record<string, string | number | boolean | null> = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (precio_oferta !== undefined) updateData.precio_oferta = precio_oferta;
    if (activo !== undefined) updateData.activo = activo;

    // Doble filtro: solo toca combos de ESTE estudio
    const { data: comboData, error: comboError } = await adminDb
      .from("combos")
      .update(updateData)
      .eq("id", id)
      .eq("estudio_id", estudioId)
      .select();

    if (comboError) throw comboError;
    if (!comboData || comboData.length === 0) {
      return NextResponse.json(
        { ok: false, mensaje: "No encontrado" },
        { status: 404 },
      );
    }

    if (servicio_ids) {
      await adminDb.from("combo_servicios").delete().eq("combo_id", id);
      if (servicio_ids.length > 0) {
        const relaciones = servicio_ids.map((servicioId: string) => ({
          combo_id: id,
          servicio_id: servicioId,
        }));
        const { error: relError } = await adminDb
          .from("combo_servicios")
          .insert(relaciones);
        if (relError) throw relError;
      }
    }

    return NextResponse.json({ ok: true, data: comboData[0] });
  } catch (e: unknown) {
    const mensaje =
      e instanceof Error ? e.message : "Error al actualizar combo";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { ok: false, mensaje: "Falta id del combo" },
      { status: 400 },
    );

  try {
    // Doble filtro: solo borra combos de ESTE estudio
    const { data, error } = await adminDb
      .from("combos")
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

    // Recién ahora limpio las relaciones (el combo era de este estudio)
    await adminDb.from("combo_servicios").delete().eq("combo_id", id);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al eliminar combo";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
