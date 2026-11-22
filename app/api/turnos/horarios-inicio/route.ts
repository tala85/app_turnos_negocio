import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const estudioId = searchParams.get("estudioId");
  const fecha = searchParams.get("fecha");
  const duracionMin = searchParams.get("duracionMin");

  if (!estudioId || !fecha || !duracionMin) {
    return NextResponse.json(
      { ok: false, mensaje: "Faltan parámetros" },
      { status: 400 },
    );
  }

  try {
    // ✅ Parsear la fecha como UTC medianoche (no como hora local)
    const [y, m, d] = fecha.split("-").map(Number);
    const diaSemana = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // ← getUTCDay, no getDay
    const fechaStr = fecha; // ya es YYYY-MM-DD

    // 1. Obtener horarios configurados
    const { data: horariosData } = await adminDb
      .from("horarios_trabajo")
      .select("*")
      .eq("estudio_id", estudioId)
      .eq("dia_semana", diaSemana)
      .eq("activo", true);

    // 2. Obtener excepciones para esta fecha
    const { data: excepcionesData } = await adminDb
      .from("horarios_excepciones")
      .select("*")
      .eq("estudio_id", estudioId)
      .eq("fecha", fechaStr);

    // 3. Determinar qué horarios usar
    let horariosUsar = horariosData || [];
    if (excepcionesData && excepcionesData.length > 0) {
      horariosUsar = excepcionesData.map((e) => ({
        hora_inicio: e.hora_inicio,
        hora_fin: e.hora_fin,
      }));
    }

    if (horariosUsar.length === 0) {
      return NextResponse.json({ ok: true, horarios: [] });
    }

    // 4. Generar slots disponibles dentro de los horarios
    const duracion = parseInt(duracionMin);
    const slotsDisponibles: {
      inicio: string;
      fin: string;
      slots_necesarios: number;
    }[] = [];

    for (const horario of horariosUsar) {
      const [horaIni, minIni] = horario.hora_inicio.split(":").map(Number);
      const [horaFin, minFin] = horario.hora_fin.split(":").map(Number);

      const inicioMinutos = horaIni * 60 + minIni;
      const finMinutos = horaFin * 60 + minFin;

      for (
        let minutos = inicioMinutos;
        minutos + duracion <= finMinutos;
        minutos += 30
      ) {
        const horaInicio = Math.floor(minutos / 60);
        const minInicio = minutos % 60;
        const horaFinSlot = Math.floor((minutos + duracion) / 60);
        const minFinSlot = (minutos + duracion) % 60;

        // ✅ Construir en UTC explícito (naive-UTC: la hora local se guarda como Z)
        const inicioISO = new Date(
          Date.UTC(y, m - 1, d, horaInicio, minInicio, 0),
        );
        const finISO = new Date(
          Date.UTC(y, m - 1, d, horaFinSlot, minFinSlot, 0),
        );

        slotsDisponibles.push({
          inicio: inicioISO.toISOString(),
          fin: finISO.toISOString(),
          slots_necesarios: Math.ceil(duracion / 30),
        });
      }
    }

    return NextResponse.json({ ok: true, horarios: slotsDisponibles });
  } catch (e: unknown) {
    const mensaje =
      e instanceof Error ? e.message : "Error al obtener horarios";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
