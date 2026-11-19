import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

// ═══════════════════════════════════════════════
// GET: listar campañas del estudio
// ═══════════════════════════════════════════════
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estudioId = searchParams.get('estudioId');

  if (!estudioId) {
    return NextResponse.json(
      { ok: false, mensaje: 'Falta estudioId' },
      { status: 400 }
    );
  }

  try {
    const { data: campanas, error } = await adminDb
      .from('campanas')
      .select('*, combos(nombre), servicios(nombre)')
      .eq('estudio_id', estudioId)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      campanas: campanas || [],
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al listar';
    console.error('[campanas GET]', e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════
// POST: crear campaña nueva
// ═══════════════════════════════════════════════
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      estudioId,
      titulo,
      descripcion,
      imagen_url,
      tipo,
      combo_id,
      servicio_id,
      fecha_inicio,
      fecha_fin,
      cupos,
      precio_especial,
      activa,
    } = body;

    // Validaciones mínimas
    if (!estudioId || !titulo || !tipo || !fecha_inicio || !fecha_fin) {
      return NextResponse.json(
        { ok: false, mensaje: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
      return NextResponse.json(
        { ok: false, mensaje: 'La fecha fin debe ser posterior a la fecha inicio' },
        { status: 400 }
      );
    }

    // Validar que tenga combo O servicio O ninguno (campaña genérica)
    if (combo_id && servicio_id) {
      return NextResponse.json(
        { ok: false, mensaje: 'La campaña puede vincular un combo O un servicio, no ambos' },
        { status: 400 }
      );
    }

    const { data, error } = await adminDb
      .from('campanas')
      .insert({
        estudio_id: estudioId,
        titulo,
        descripcion: descripcion || null,
        imagen_url: imagen_url || null,
        tipo,
        combo_id: combo_id || null,
        servicio_id: servicio_id || null,
        fecha_inicio,
        fecha_fin,
        cupos: cupos || null,
        precio_especial: precio_especial || null,
        activa: activa !== false, // default true
        orden: body.orden || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, campana: data });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al crear';
    console.error('[campanas POST]', e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════
// PATCH: actualizar campaña (incluye toggle activa)
// ═══════════════════════════════════════════════
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, mensaje: 'Falta id de la campaña' },
        { status: 400 }
      );
    }

    // Validaciones de fechas si se están actualizando
    if (updates.fecha_inicio || updates.fecha_fin) {
      const inicio = updates.fecha_inicio || updates.fecha_fin;
      const fin = updates.fecha_fin || updates.fecha_inicio;
      if (new Date(fin) < new Date(inicio)) {
        return NextResponse.json(
          { ok: false, mensaje: 'La fecha fin debe ser posterior a la fecha inicio' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await adminDb
      .from('campanas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, campana: data });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al actualizar';
    console.error('[campanas PATCH]', e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════
// DELETE: borrar campaña
// ═══════════════════════════════════════════════
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { ok: false, mensaje: 'Falta id de la campaña' },
        { status: 400 }
      );
    }

    const { error } = await adminDb
      .from('campanas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al borrar';
    console.error('[campanas DELETE]', e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}