import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";

const DIAS_VENTANA = 45;

// ── Helpers ─────────────────────────────────────────────
function aFechaISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function aISOMedianoche(d: Date): string {
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0),
  ).toISOString();
}

type SlotNuevo = {
  estudio_id: string;
  inicio: string;
  fin: string;
  estado: string;
};

function agregarSlots(
  destino: SlotNuevo[],
  estudioId: string,
  fecha: Date,
  horaInicio: string,
  horaFin: string,
  paso: number,
  existentes: Set<string>,
) {
  const [hI, mI] = horaInicio.split(":").map(Number);
  const [hF, mF] = horaFin.split(":").map(Number);
  const inicioMin = hI * 60 + mI;
  const finMin = hF * 60 + mF;

  for (let m = inicioMin; m + paso <= finMin; m += paso) {
    const ini = new Date(
      Date.UTC(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        Math.floor(m / 60),
        m % 60,
        0,
      ),
    );
    const fin = new Date(
      Date.UTC(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        Math.floor((m + paso) / 60),
        (m + paso) % 60,
        0,
      ),
    );
    const isoIni = ini.toISOString();
    if (!existentes.has(isoIni)) {
      existentes.add(isoIni); // evita duplicados dentro del mismo lote
      destino.push({
        estudio_id: estudioId,
        inicio: isoIni,
        fin: fin.toISOString(),
        estado: "libre",
      });
    }
  }
}

// ── Cron ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // 🔒 Seguridad: solo Vercel Cron (o vos con el secret) puede llamar esto
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { ok: false, mensaje: "No autorizado" },
      { status: 401 },
    );
  }

  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { data: estudios, error: errEstudios } = await adminDb
      .from("estudios")
      .select(
        "id, paso_minutos, horarios_trabajo(dia_semana, hora_inicio, hora_fin, activo)",
      );

    if (errEstudios) throw errEstudios;

    let totalInsertados = 0;
    const detalle: string[] = [];

    for (const estudio of estudios || []) {
      const paso = Number(estudio.paso_minutos) || 30;
      const horarios = (estudio.horarios_trabajo || []).filter((h) => h.activo);

      // ¿Hasta qué día hay agenda hoy?
      const { data: maxRow } = await adminDb
        .from("turnos")
        .select("inicio")
        .eq("estudio_id", estudio.id)
        .order("inicio", { ascending: false })
        .limit(1);

      const ultimoDia = maxRow?.[0]?.inicio ? new Date(maxRow[0].inicio) : null;
      if (ultimoDia) ultimoDia.setHours(0, 0, 0, 0);

      // Rango a generar: desde (último día + 1) hasta hoy + ventana
      const desde = ultimoDia
        ? new Date(
            ultimoDia.getFullYear(),
            ultimoDia.getMonth(),
            ultimoDia.getDate() + 1,
          )
        : new Date(hoy);
      const hasta = new Date(hoy);
      hasta.setDate(hoy.getDate() + DIAS_VENTANA);

      // Horarios ya existentes (para no duplicar)
      const { data: existentes } = await adminDb
        .from("turnos")
        .select("inicio")
        .eq("estudio_id", estudio.id)
        .gte("inicio", aISOMedianoche(desde));
      const iniciosExistentes = new Set<string>(
        (existentes || []).map((t) => t.inicio),
      );

      const nuevos: SlotNuevo[] = [];

      // A) Días de la ventana con horario habitual
      if (desde <= hasta) {
        for (let d = new Date(desde); d <= hasta; d.setDate(d.getDate() + 1)) {
          const franjas = horarios.filter((h) => h.dia_semana === d.getDay());
          for (const f of franjas) {
            agregarSlots(
              nuevos,
              estudio.id,
              d,
              f.hora_inicio,
              f.hora_fin,
              paso,
              iniciosExistentes,
            );
          }
        }
      }

      // B) Días extra (excepciones futuras) que aún no tengan turnos
      const { data: excepciones } = await adminDb
        .from("horarios_excepciones")
        .select("fecha, hora_inicio, hora_fin")
        .eq("estudio_id", estudio.id)
        .gte("fecha", aFechaISO(hoy));

      for (const ex of excepciones || []) {
        const fecha = new Date(ex.fecha + "T00:00:00");
        agregarSlots(
          nuevos,
          estudio.id,
          fecha,
          ex.hora_inicio,
          ex.hora_fin,
          paso,
          iniciosExistentes,
        );
      }

      if (nuevos.length > 0) {
        const { data, error: errInsert } = await adminDb
          .from("turnos")
          .upsert(nuevos, {
            onConflict: "estudio_id,inicio",
            ignoreDuplicates: true,
          })
          .select("id");

        if (errInsert) throw errInsert;

        const realmenteInsertados = (data || []).length;
        if (realmenteInsertados > 0) {
          totalInsertados += realmenteInsertados;
          detalle.push(
            `estudio ${estudio.id.slice(0, 8)}: +${realmenteInsertados} turnos (${nuevos.length - realmenteInsertados} ya existían)`,
          );
        }
      }
    }

    return NextResponse.json({
      ok: true,
      insertados: totalInsertados,
      detalle,
    });
  } catch (e: unknown) {
    // ⚠️ Los errores de Supabase NO son instanceof Error: son objetos { message, code, details }.
    //    Los exponemos completos para poder diagnosticar la causa real.
    const err = e as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    } | null;
    const mensaje =
      err?.message ?? (e instanceof Error ? e.message : "Error interno");

    console.error("[cron extender-agenda]", JSON.stringify(err ?? String(e)));

    return NextResponse.json(
      {
        ok: false,
        mensaje,
        code: err?.code ?? null,
        details: err?.details ?? null,
      },
      { status: 500 },
    );
  }
}
