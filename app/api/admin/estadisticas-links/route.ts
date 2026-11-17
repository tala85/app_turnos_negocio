import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { verificarAdmin } from "@/lib/auth";

// ✅ Definimos el tipo exacto de lo que devuelve la base de datos
type ClickRow = {
  origen: string;
};

export async function GET(req: Request) {
  if (!(await verificarAdmin())) {
    return NextResponse.json(
      { ok: false, mensaje: "No autorizado" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const estudioId = searchParams.get("estudioId");

  if (!estudioId) {
    return NextResponse.json(
      { ok: false, mensaje: "Falta estudioId" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await adminDb
      .from("link_clicks")
      .select("origen") // Solo necesitamos esta columna
      .eq("estudio_id", estudioId)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    // ✅ Ahora TypeScript sabe que 'row' es de tipo ClickRow
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
