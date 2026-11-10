import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verificar que sea una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;

      // Consultar el estado del pago en MercadoPago
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const payment = await response.json();

      if (payment.status === 'approved') {
        // Pago aprobado: actualizar la reserva en la base de datos
        const reservaId = payment.external_reference;

        await adminDb
          .from('turnos')
          .update({ estado: 'pagado' })
          .eq('reserva_id', reservaId);

        await adminDb.from('pagos').insert({
          estudio_id: (await adminDb.from('turnos').select('estudio_id').eq('reserva_id', reservaId).single()).data?.estudio_id,
          reserva_id: reservaId,
          mp_payment_id: paymentId,
          monto: payment.transaction_amount,
          estado: 'approved',
          raw: payment,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('[pago/webhook]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}