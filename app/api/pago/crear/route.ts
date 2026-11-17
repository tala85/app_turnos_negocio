import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reservaId, total, sena, cliente } = body;

    console.log("[pago/crear] Body recibido:", body);

    if (!reservaId || !total || !sena || !cliente) {
      return NextResponse.json(
        { ok: false, mensaje: "Faltan datos" },
        { status: 400 },
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

    // ✅ Derivar la URL base del propio request (funciona en local y en Vercel)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    console.log("[pago/crear] App URL:", appUrl);

    const backUrls = {
      success: `${appUrl}/pago/exito?reservaId=${reservaId}`,
      failure: `${appUrl}/pago/fallo?reservaId=${reservaId}`,
      pending: `${appUrl}/pago/pendiente?reservaId=${reservaId}`,
    };

    console.log("[pago/crear] Back URLs:", backUrls);

    const payload = {
      items: [
        {
          title: `Seña para reserva - ${cliente.nombre} ${cliente.apellido}`,
          description: `Reserva ID: ${reservaId}`,
          quantity: 1,
          unit_price: Number(sena),
          currency_id: "ARS",
        },
      ],
      payer: {
        name: cliente.nombre,
        surname: cliente.apellido,
      },
      external_reference: reservaId,
      back_urls: backUrls,
      auto_return: "approved",
      // ⚠️ NO usar sandbox_mode: true (está deprecado en la API v1)
      // En vez de eso, usamos las credenciales de prueba + sandbox_init_point
      notification_url: `${appUrl}/api/pago/webhook`, // ← CLAVE: registra el webhook por preferencia
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

    console.log("[pago/crear] Respuesta de MP:", {
      status: response.status,
      data: data,
    });

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
