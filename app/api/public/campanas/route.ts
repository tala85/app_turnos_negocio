import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estudioId = searchParams.get("estudioId");

  if (!estudioId) {
    return NextResponse.json(
      { ok: false, mensaje: "Falta estudioId" },
      { status: 400 },
    );
  }

  const hoy = new Date().toISOString().split("T")[0];

  const { data: campanas, error } = await supabase
    .from("campanas")
    .select("*, combos(nombre, precio_oferta), servicios(nombre, precio)")
    .eq("estudio_id", estudioId)
    .eq("activa", true)
    .order("orden", { ascending: true });

  if (error) {
    return NextResponse.json(
      { ok: false, mensaje: error.message },
      { status: 500 },
    );
  }

  // ✅ Filtrado en JS: días puntuales tienen prioridad sobre el rango
  const activasHoy = (campanas || []).filter(
    (c: {
      fechas_especificas: string[] | null;
      fecha_inicio: string;
      fecha_fin: string;
    }) => {
      if (c.fechas_especificas && c.fechas_especificas.length > 0) {
        return c.fechas_especificas.includes(hoy);
      }
      return hoy >= c.fecha_inicio && hoy <= c.fecha_fin;
    },
  );

  return NextResponse.json({ ok: true, campanas: activasHoy });
}
