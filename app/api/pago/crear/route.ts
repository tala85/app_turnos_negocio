import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin"; // ✅ AGREGADO: para validar contra la BD

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reservaId } = body; // ✅ Solo pedimos el ID. Los montos los sacamos de la BD.

    if (!reservaId) {
      return NextResponse.json(
        { ok: false, mensaje: "Falta reservaId" },
        { status: 400 },
      );
    }

    // 🔒 BLINDAJE 1: Verificar que la reserva existe, es legítima y no está ya pagada
    const { data: reserva, error: dbError } = await adminDb
      .from("reservas")
      .select(
        "id, estado, sena, total, cliente_nombre, cliente_apellido, estudio_id",
      )
      .eq("id", reservaId)
      .single();

    if (dbError || !reserva) {
      return NextResponse.json(
        { ok: false, mensaje: "Reserva no encontrada o inválida" },
        { status: 404 },
      );
    }

    if (reserva.estado === "pagada" || reserva.estado === "cancelada") {
      return NextResponse.json(
        { ok: false, mensaje: "Esta reserva ya fue procesada" },
        { status: 409 },
      );
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("[pago/crear] ❌ Falta MERCADOPAGO_ACCESS_TOKEN");
      return NextResponse.json(
        { ok: false, mensaje: "Configuración de pago incompleta" },
        { status: 500 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

    const payload = {
      items: [
        {
          title: `Seña para reserva - ${reserva.cliente_nombre} ${reserva.cliente_apellido}`,
          description: `Reserva ID: ${reservaId}`,
          quantity: 1,
          // 🔒 BLINDAJE 2: Usar el monto REAL de la BD, ignorando lo que diga el frontend
          unit_price: Number(reserva.sena),
          currency_id: "ARS",
        },
      ],
      payer: {
        name: reserva.cliente_nombre,
        surname: reserva.cliente_apellido,
      },
      external_reference: reservaId,
      back_urls: {
        success: `${appUrl}/pago/exito?reservaId=${reservaId}`,
        failure: `${appUrl}/pago/fallo?reservaId=${reservaId}`,
        pending: `${appUrl}/pago/pendiente?reservaId=${reservaId}`,
      },
      notification_url: `${appUrl}/api/pago/webhook`,
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, mensaje: data.message || "Error al crear preferencia" },
        { status: response.status },
      );
    }

    return NextResponse.json({
      ok: true,
      initPoint: data.sandbox_init_point || data.init_point,
      preferenceId: data.id,
    });
  } catch (e: unknown) {
    const mensaje =
      e instanceof Error ? e.message : "Error al crear preferencia";
    console.error("[pago/crear] Error:", e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
