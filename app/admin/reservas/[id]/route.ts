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

    // Obtener la reserva para saber los turno_ids
    const { data: reserva, error: errorReserva } = await adminDb
      .from('reservas')
      .select('turno_ids, estado')
      .eq('id', id)
      .single();

    if (errorReserva || !reserva) {
      return NextResponse.json(
        { ok: false, mensaje: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Si se cancela, liberar los turnos
    if (estado === 'cancelada' && reserva.turno_ids?.length > 0) {
      await adminDb
        .from('turnos')
        .update({ estado: 'libre' })
        .in('id', reserva.turno_ids);
    }

    // Si se confirma desde pagada, actualizar turnos a "confirmado"
    if (estado === 'confirmada' && reserva.turno_ids?.length > 0) {
      await adminDb
        .from('turnos')
        .update({ estado: 'confirmado' })
        .in('id', reserva.turno_ids);
    }

    // Actualizar el estado de la reserva
    const { error: errorUpdate } = await adminDb
      .from('reservas')
      .update({ estado })
      .eq('id', id);

    if (errorUpdate) throw errorUpdate;

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al actualizar';
    console.error('[admin/reservas]', e);
    return NextResponse.json(
      { ok: false, mensaje },
      { status: 500 }
    );
  }
}