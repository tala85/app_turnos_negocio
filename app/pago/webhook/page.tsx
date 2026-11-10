import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('[webhook] Notificación recibida:', JSON.stringify(body));

    // MercadoPago envía notificaciones con type 'payment'
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;

      // Consultar el pago en MP
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const payment = await response.json();

      console.log('[webhook] Pago consultado:', payment.status);

      if (payment.status === 'approved') {
        const reservaId = payment.external_reference;

        if (!reservaId) {
          console.error('[webhook] No hay external_reference en el pago');
          return NextResponse.json({ ok: true });
        }

        // Actualizar la reserva a "pagada"
        const { error: errorReserva } = await adminDb
          .from('reservas')
          .update({
            estado: 'pagada',
            mp_payment_id: paymentId,
            mp_preference_id: payment.preference_id || null,
          })
          .eq('id', reservaId);

        if (errorReserva) {
          console.error('[webhook] Error actualizando reserva:', errorReserva);
          throw errorReserva;
        }

        // Actualizar los turnos a "pagado"
        const { data: reserva } = await adminDb
          .from('reservas')
          .select('turno_ids')
          .eq('id', reservaId)
          .single();

        if (reserva?.turno_ids && reserva.turno_ids.length > 0) {
          await adminDb
            .from('turnos')
            .update({ estado: 'pagado' })
            .in('id', reserva.turno_ids);
        }

        console.log('[webhook] ✅ Pago confirmado para reserva:', reservaId);
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        // Pago rechazado: liberar los turnos
        const reservaId = payment.external_reference;
        if (reservaId) {
          const { data: reserva } = await adminDb
            .from('reservas')
            .select('turno_ids')
            .eq('id', reservaId)
            .single();

          if (reserva?.turno_ids && reserva.turno_ids.length > 0) {
            await adminDb
              .from('turnos')
              .update({ estado: 'libre' })
              .in('id', reserva.turno_ids);
          }

          await adminDb
            .from('reservas')
            .update({ estado: 'cancelada' })
            .eq('id', reservaId);

          console.log('[webhook] ❌ Pago rechazado, turnos liberados:', reservaId);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[webhook] Error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}