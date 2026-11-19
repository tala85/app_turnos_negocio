import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { enviarNotificacionAEstudio } from "@/lib/webpush";
import crypto from "crypto";

function validarFirmaMP(req: Request): boolean {
  const signature = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");

  if (!signature || !requestId) return false;

  const parts = signature.split(";");
  const ts = parts.find((p) => p.startsWith("ts="))?.split("=")[1];
  const v1 = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!ts || !v1) return false;

  const secret = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const manifest = `id:${requestId};request-topic:payment;ts:${ts};url:${req.url}`;

  const hmac = crypto.createHmac("sha256", secret!);
  hmac.update(manifest);
  const calculatedSignature = hmac.digest("hex");

  return calculatedSignature === v1;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Filtrar solo notificaciones de pago
    if (body.type !== "payment") {
      return NextResponse.json({ ok: true, mensaje: "Ignorado" });
    }

    // 2. Validar firma (la doble verificación es la definitiva)
    if (!validarFirmaMP(req)) {
      console.warn(
        "⚠️ Webhook con firma inválida o faltante. Se procederá a la doble verificación.",
      );
    }

    const paymentId = body.data.id;

    // 3. DOBLE VERIFICACIÓN: consultar el estado REAL del pago en MercadoPago
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      },
    );

    const payment = await response.json();

    if (payment.status === "approved") {
      const reservaId = payment.external_reference;

      // Actualizar turnos
      await adminDb
        .from("turnos")
        .update({ estado: "pagado" })
        .eq("reserva_id", reservaId);

      // Actualizar reserva
      await adminDb
        .from("reservas")
        .update({ estado: "pagada" })
        .eq("id", reservaId);

      // Registrar el pago
      const { data: reserva } = await adminDb
        .from("reservas")
        .select("estudio_id, cliente_nombre, cliente_apellido, total, sena")
        .eq("id", reservaId)
        .single();

      await adminDb.from("pagos").insert({
        estudio_id: reserva?.estudio_id,
        reserva_id: reservaId,
        mp_payment_id: paymentId,
        monto: payment.transaction_amount,
        estado: "approved",
        raw: payment,
      });

      console.log(`✅ Pago aprobado y registrado: ${reservaId}`);

      // ═══════════════════════════════════════════════
      // 🔔 NUEVO: notificar al estudio (con try/catch propio
      // para que un fallo de push NUNCA rompa el webhook)
      // ═══════════════════════════════════════════════
      if (reserva?.estudio_id) {
        try {
          await enviarNotificacionAEstudio(reserva.estudio_id, {
            titulo: "💰 Nueva seña pagada",
            cuerpo: `${reserva.cliente_nombre} ${reserva.cliente_apellido} · Seña $${reserva.sena?.toLocaleString("es-AR")} · Total $${reserva.total?.toLocaleString("es-AR")}`,
            url: "/admin/reservas",
            tag: `pago-${reservaId}`, // evita que se apilen notificaciones de la misma reserva
          });
          console.log("🔔 Notificación de pago enviada");
        } catch (e) {
          // Importante: NO re-lanzar. MP no debe reintentar el webhook por un fallo de push.
          console.error("[webhook] fallo enviando notificación:", e);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[pago/webhook] Error:", e);
    return NextResponse.json(
      { ok: false, mensaje: "Error interno" },
      { status: 500 },
    );
  }
}
