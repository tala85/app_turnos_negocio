import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { verificarSuperAdmin } from "@/lib/super-admin-auth";

export async function GET() {
  const esSuperAdmin = await verificarSuperAdmin();
  if (!esSuperAdmin) {
    return NextResponse.json(
      { ok: false, mensaje: "No autorizado" },
      { status: 401 },
    );
  }

  try {
    const hace30Dias = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // 5 consultas en paralelo. La E (estudios) es nueva: trae id+nombre para mapear a mano.
    const [
      totalEstudiosRes,
      reservasMesRes,
      ingresosMesRes,
      reservasEstudioIdRes,
      estudiosRes,
    ] = await Promise.all([
      adminDb.from("estudios").select("*", { count: "exact", head: true }),

      adminDb
        .from("reservas")
        .select("*", { count: "exact", head: true })
        .gte("created_at", hace30Dias),

      adminDb
        .from("reservas")
        .select("total")
        .eq("estado", "confirmada")
        .gte("created_at", hace30Dias),

      // D) solo el estudio_id de cada reserva (sin JOIN)
      adminDb
        .from("reservas")
        .select("estudio_id")
        .gte("created_at", hace30Dias),

      // E) catálogo de estudios id→nombre (6 filas, baratisimo)
      adminDb.from("estudios").select("id, nombre"),
    ]);

    const totalEstudios = totalEstudiosRes.count ?? 0;
    const reservasEsteMes = reservasMesRes.count ?? 0;

    const ingresos = (ingresosMesRes.data || []).reduce(
      (sum, item) => sum + (Number(item.total) || 0),
      0,
    );

        const confirmadas = (ingresosMesRes.data || []).length;
    const tasaConversion =
      reservasEsteMes > 0 ? Math.round((confirmadas / reservasEsteMes) * 100) : 0;

    // ✅ Top 3 con MAPEO MANUAL (no depende de la FK/relación anidada)
    const nombrePorId = new Map(
      (estudiosRes.data || []).map((e: { id: string; nombre: string }) => [
        e.id,
        e.nombre,
      ]),
    );

    const conteoPorEstudio: Record<
      string,
      { nombre: string; cantidad: number }
    > = {};

    (reservasEstudioIdRes.data || []).forEach((r: { estudio_id: string }) => {
      const id = r.estudio_id;
      const nombre = nombrePorId.get(id) ?? "Estudio desconocido";
      if (!conteoPorEstudio[id]) {
        conteoPorEstudio[id] = { nombre, cantidad: 0 };
      }
      conteoPorEstudio[id].cantidad += 1;
    });

    const topEstudios = Object.values(conteoPorEstudio)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3);

    return NextResponse.json({
      ok: true,
      metricas: {
        totalEstudios,
        reservasEsteMes,
        ingresos,
        tasaConversion,
        topEstudios,
      },
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error interno";
    console.error("[metricas-super-admin]", mensaje);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
