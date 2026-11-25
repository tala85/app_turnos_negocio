import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { estudioId, turnoIds, servicioIds, comboIds, cliente } = body;

    if (!estudioId || !turnoIds || !servicioIds || !cliente) {
      return NextResponse.json(
        { ok: false, mensaje: "Faltan datos" },
        { status: 400 },
      );
    }

    // 🔒 BLINDAJE 1: Verificar que los turnos existen y PERTENECEN a este estudio
    const { data: turnosDB, error: errorTurnos } = await adminDb
      .from("turnos")
      .select("id, estado")
      .in("id", turnoIds)
      .eq("estudio_id", estudioId);

    if (errorTurnos || !turnosDB || turnosDB.length !== turnoIds.length) {
      return NextResponse.json(
        {
          ok: false,
          mensaje:
            "Uno o más turnos son inválidos o no pertenecen a este estudio",
        },
        { status: 400 },
      );
    }

    // Verificar que no estén ya ocupados/bloqueados
    const turnosOcupados = turnosDB.filter((t) => t.estado !== "libre");
    if (turnosOcupados.length > 0) {
      return NextResponse.json(
        { ok: false, mensaje: "Uno o más turnos ya no están disponibles" },
        { status: 409 },
      );
    }

    // 🔒 BLINDAJE 2: Obtener SOLO los servicios/combos que pertenecen a este estudio
    // (Ignoramos cualquier ID inyectado por el frontend que no sea de este estudio)
    const [{ data: serviciosDB }, { data: combosDB }] = await Promise.all([
      adminDb
        .from("servicios")
        .select("id, precio, duracion_min")
        .in("id", servicioIds)
        .eq("estudio_id", estudioId),
      comboIds && comboIds.length > 0
        ? adminDb
            .from("combos")
            .select("id, precio_oferta")
            .in("id", comboIds)
            .eq("estudio_id", estudioId)
        : Promise.resolve({ data: [] }),
    ]);

    // 🔒 BLINDAJE 3: Calcular el total basándonos ÚNICAMENTE en lo que devolvió la BD
    let total = 0;
    serviciosDB?.forEach((s) => (total += Number(s.precio)));
    combosDB?.forEach((c) => (total += Number(c.precio_oferta)));

    const sena = Math.round((total * 30) / 100);
    const requiereSena = total > 0;

    // 🔒 BLINDAJE 4: Bloquear SOLO los turnos que ya validamos que son de este estudio
    const { error: errorBloqueo } = await adminDb
      .from("turnos")
      .update({ estado: "bloqueado" })
      .in("id", turnoIds); // (Sabemos que son seguros por el Blindaje 1)

    if (errorBloqueo) throw errorBloqueo;

    // Crear la reserva
    const { data: reserva, error: errorReserva } = await adminDb
      .from("reservas")
      .insert({
        estudio_id: estudioId,
        cliente_nombre: cliente.nombre,
        cliente_apellido: cliente.apellido,
        cliente_dni: cliente.dni,
        cliente_telefono: cliente.telefono,
        estado: "bloqueada",
        total,
        sena,
        servicio_ids: servicioIds,
        combo_ids: comboIds || [],
        turno_ids: turnoIds,
      })
      .select()
      .single();

    if (errorReserva) throw errorReserva;

    return NextResponse.json({
      ok: true,
      reservaId: reserva.id,
      total,
      sena,
      requiereSena,
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al reservar";
    console.error("[reservas/bloqueo] Error:", e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
