import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { estado } = body;

    if (!estado || !['bloqueada', 'pagada', 'confirmada', 'cancelada'].includes(estado)) {
      return NextResponse.json(
        { ok: false, mensaje: 'Estado inválido' },
        { status: 400 }
      );
    }

    const { data: reserva, error: errorReserva } = await adminDb
      .from('reservas')
      .select('turno_ids, estado, servicio_ids, combo_ids')
      .eq('id', id)
      .single();

    if (errorReserva || !reserva) {
      return NextResponse.json(
        { ok: false, mensaje: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    if (estado === 'cancelada' && reserva.turno_ids?.length > 0) {
      await adminDb
        .from('turnos')
        .update({ estado: 'libre' })
        .in('id', reserva.turno_ids);
    }

    if (estado === 'confirmada' && reserva.turno_ids?.length > 0) {
      await adminDb
        .from('turnos')
        .update({ estado: 'confirmado' })
        .in('id', reserva.turno_ids);
    }

    const { error: errorUpdate } = await adminDb
      .from('reservas')
      .update({ estado })
      .eq('id', id);

    if (errorUpdate) throw errorUpdate;

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al actualizar';
    console.error('[admin/reservas] Error:', e);
    return NextResponse.json(
      { ok: false, mensaje },
      { status: 500 }
    );
  }
}

// GET para obtener detalles de una reserva
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: reserva, error } = await adminDb
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !reserva) {
      return NextResponse.json(
        { ok: false, mensaje: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Obtener servicios
    let servicios = [];
    if (reserva.servicio_ids?.length > 0) {
      const { data } = await adminDb
        .from('servicios')
        .select('*')
        .in('id', reserva.servicio_ids);
      servicios = data || [];
    }

    // Obtener combos
    let combos = [];
    if (reserva.combo_ids?.length > 0) {
      const { data } = await adminDb
        .from('combos')
        .select('*')
        .in('id', reserva.combo_ids);
      combos = data || [];
    }

    // Obtener turnos (horarios)
    let turnos = [];
    if (reserva.turno_ids?.length > 0) {
      const { data } = await adminDb
        .from('turnos')
        .select('*')
        .in('id', reserva.turno_ids)
        .order('inicio');
      turnos = data || [];
    }

    // Obtener estudio
    const { data: estudio } = await adminDb
      .from('estudios')
      .select('nombre, direccion, telefono')
      .eq('id', reserva.estudio_id)
      .single();

    return NextResponse.json({
      ok: true,
      reserva: {
        ...reserva,
        servicios,
        combos,
        turnos,
        estudio,
      },
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al obtener reserva';
    console.error('[admin/reservas GET] Error:', e);
    return NextResponse.json(
      { ok: false, mensaje },
      { status: 500 }
    );
  }
}