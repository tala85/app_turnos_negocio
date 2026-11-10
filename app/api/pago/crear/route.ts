import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reservaId, total, sena, cliente } = body;

    console.log("[pago/crear] Body recibido:", body);

    // Validaciones
    if (!reservaId || !total || !sena || !cliente) {
      return NextResponse.json(
        { ok: false, mensaje: "Faltan datos" },
        { status: 400 },
      );
    }

    // Verificar que tengamos el Access Token
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("[pago/crear] ❌ Falta MERCADOPAGO_ACCESS_TOKEN");
      return NextResponse.json(
        { ok: false, mensaje: "Configuración de pago incompleta" },
        { status: 500 },
      );
    }

    console.log("[pago/crear] ✅ Access Token encontrado");

    // URL base de la app
    const appUrl = "https://culminate-friend-coming.ngrok-free.dev";
    console.log("[pago/crear] App URL:", appUrl);

    // ✅ URLs de retorno (hardcodeadas para probar)
    const backUrls = {
      success:
        "https://culminate-friend-coming.ngrok-free.dev/pago/exito?reservaId=" +
        reservaId,
      failure:
        "https://culminate-friend-coming.ngrok-free.dev/pago/fallo?reservaId=" +
        reservaId,
      pending:
        "https://culminate-friend-coming.ngrok-free.dev/pago/pendiente?reservaId=" +
        reservaId,
    };

    console.log("[pago/crear] Back URLs:", backUrls);

    // Crear preferencia
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
      // auto_return: 'approved',  // Comentado temporalmente
      // ✅ FORZAR MODO SANDBOX (prueba)
      // sandbox_mode: true,  ← BORRAR O COMENTAR ESTA LÍNEA
    };

    console.log(
      "[pago/crear] Payload completo:",
      JSON.stringify(payload, null, 2),
    );

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
      initPoint: data.sandbox_init_point || data.init_point, // ← USAR SANDBOX
      preferenceId: data.id,
    });
  } catch (e: unknown) {
    const mensaje =
      e instanceof Error ? e.message : "Error al crear preferencia";
    console.error("[pago/crear] Error:", e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
