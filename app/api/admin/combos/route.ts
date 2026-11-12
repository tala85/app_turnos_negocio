import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const estudioId = searchParams.get('estudioId');

  if (!estudioId) {
    return NextResponse.json({ ok: false, mensaje: 'Falta estudioId' }, { status: 400 });
  }

  try {
    const { data, error } = await adminDb
      .from('combos')
      .select('*, combo_servicios(servicio_id)')
      .eq('estudio_id', estudioId)
      .eq('activo', true)
      .order('nombre');

    if (error) throw error;

    return NextResponse.json({ ok: true, data: data || [] });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al obtener combos';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🕵️‍♂️ CÁMARA 2: ¿Qué recibió realmente el servidor?
    console.log("📬 DATOS RECIBIDOS POR EL SERVIDOR:", body);

    const { estudioId, nombre, descripcion, precio_oferta, servicio_ids, activo = true } = body;

    if (!estudioId || !nombre || !precio_oferta || !servicio_ids || servicio_ids.length === 0) {
      return NextResponse.json({ ok: false, mensaje: 'Faltan datos requeridos' }, { status: 400 });
    }

    // 1. Crear el combo
    const { data: comboData, error: comboError } = await adminDb
      .from('combos')
      .insert({
        estudio_id: estudioId,
        nombre,
        descripcion: descripcion || null,
        precio_oferta,
        activo,
      })
      .select()
      .single();

    if (comboError) throw comboError;

    // 2. Crear las relaciones en combo_servicios
    if (servicio_ids && servicio_ids.length > 0) {
      const relaciones = servicio_ids.map((servicioId: string) => ({
        combo_id: comboData.id,
        servicio_id: servicioId,
      }));

      const { error: relError } = await adminDb
        .from('combo_servicios')
        .insert(relaciones);

      if (relError) throw relError;
    }

    return NextResponse.json({ ok: true, data: comboData });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al crear combo';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, descripcion, precio_oferta, servicio_ids, activo } = body;

    if (!id) {
      return NextResponse.json({ ok: false, mensaje: 'Falta id del combo' }, { status: 400 });
    }

    // 1. Actualizar el combo
    const updateData: Record<string, string | number | boolean | null> = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (precio_oferta !== undefined) updateData.precio_oferta = precio_oferta;
    if (activo !== undefined) updateData.activo = activo;

    const { data: comboData, error: comboError } = await adminDb
      .from('combos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (comboError) throw comboError;

    // 2. Actualizar servicios del combo (eliminar viejos y agregar nuevos)
    if (servicio_ids) {
      // Eliminar relaciones existentes
      await adminDb.from('combo_servicios').delete().eq('combo_id', id);

      // Crear nuevas relaciones
      if (servicio_ids.length > 0) {
        const relaciones = servicio_ids.map((servicioId: string) => ({
          combo_id: id,
          servicio_id: servicioId,
        }));

        const { error: relError } = await adminDb
          .from('combo_servicios')
          .insert(relaciones);

        if (relError) throw relError;
      }
    }

    return NextResponse.json({ ok: true, data: comboData });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al actualizar combo';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, mensaje: 'Falta id del combo' }, { status: 400 });
  }

  try {
    // 1. Eliminar relaciones en combo_servicios
    await adminDb.from('combo_servicios').delete().eq('combo_id', id);

    // 2. Eliminar el combo
    const { error } = await adminDb.from('combos').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al eliminar combo';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}