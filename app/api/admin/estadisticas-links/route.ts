import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { obtenerEstudioDeSesion } from "@/lib/auth";

type ClickRow = {
  origen: string;
};

const noAutorizado = () =>
  NextResponse.json({ ok: false, mensaje: "No autorizado" }, { status: 401 });

export async function GET() {
  // ✅ El estudio viene de la sesión (cookie firmada), no del cliente
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    const { data, error } = await adminDb
      .from("link_clicks")
      .select("origen")
      .eq("estudio_id", estudioId) // ← FILTRO DE TENANT
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    const agrupado: Record<string, number> = {};
    data?.forEach((row: ClickRow) => {
      agrupado[row.origen] = (agrupado[row.origen] || 0) + 1;
    });

    const resultado = Object.entries(agrupado)
      .map(([origen, cantidad]) => ({
        origen,
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return NextResponse.json({ ok: true, data: resultado });
  } catch (e: unknown) {
    const mensaje =
      e instanceof Error ? e.message : "Error al obtener estadísticas";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
