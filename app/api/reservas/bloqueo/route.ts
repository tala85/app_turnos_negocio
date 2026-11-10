import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      estudioId,
      turnoIds,
      servicioIds,
      comboIds,
      cliente,
    } = body;

    console.log('[reservas/bloqueo] Body recibido:', body);

    // Validaciones
    if (!estudioId || !turnoIds || !servicioIds || !cliente) {
      return NextResponse.json(
        { ok: false, mensaje: 'Faltan datos' },
        { status: 400 }
      );
    }

    // Obtener servicios y combos para calcular el total
    const [{ data: servicios }, { data: combos }] = await Promise.all([
      adminDb
        .from('servicios')
        .select('*')
        .in('id', servicioIds),
      comboIds && comboIds.length > 0
        ? adminDb
            .from('combos')
            .select('*')
            .in('id', comboIds)
        : Promise.resolve({ data: [] }),
    ]);

    // Calcular total
    let total = 0;
    servicios?.forEach((s) => (total += s.precio));
    combos?.forEach((c) => (total += c.precio_oferta));

    const sena = Math.round((total * 30) / 100);
    const requiereSena = total > 0;

    console.log('[reservas/bloqueo] Total:', total, 'Seña:', sena);

    // Bloquear los turnos
    const { error: errorBloqueo } = await adminDb
      .from('turnos')
      .update({ estado: 'bloqueado' })
      .in('id', turnoIds);

    if (errorBloqueo) {
      console.error('[reservas/bloqueo] Error bloqueando turnos:', errorBloqueo);
      throw errorBloqueo;
    }

    // Crear la reserva
    const { data: reserva, error: errorReserva } = await adminDb
      .from('reservas')
      .insert({
        estudio_id: estudioId,
        cliente_nombre: cliente.nombre,
        cliente_apellido: cliente.apellido,
        cliente_dni: cliente.dni,
        cliente_telefono: cliente.telefono,
        estado: 'bloqueada',
        total,
        sena,
        servicio_ids: servicioIds,
        combo_ids: comboIds || [],
        turno_ids: turnoIds,
      })
      .select()
      .single();

    if (errorReserva) {
      console.error('[reservas/bloqueo] Error creando reserva:', errorReserva);
      throw errorReserva;
    }

    console.log('[reservas/bloqueo] Reserva creada:', reserva.id);

    return NextResponse.json({
      ok: true,
      reservaId: reserva.id,
      total,
      sena,
      requiereSena,
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al reservar';
    console.error('[reservas/bloqueo] Error:', e);
    return NextResponse.json(
      { ok: false, mensaje },
      { status: 500 }
    );
  }
}