import { adminDb } from "@/lib/supabase/admin";
import MetricCard from "@/components/super-admin/MetricCard"; // Ajustá la ruta si tu MetricCard está en otro lado

// ✅ Fechas calculadas fuera del render
const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000,).toISOString();

export default async function SuperAdminDashboard() {
  // ✅ Consultas en paralelo (agregamos las nuevas métricas de negocio)
  const [
    totalEstudios,
    estudiosNuevos,
    reservasMes,
    reservasConfirmadasMes, // Para calcular ingresos y conversión
    totalClicks,
    campanasActivas,
    totalServicios,
    topEstudiosRes,
    estudiosCatalogo, // Para mapear nombres de forma segura
  ] = await Promise.all([
    adminDb.from("estudios").select("id", { count: "exact", head: true }),
    adminDb
      .from("estudios")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hace7dias),
    adminDb
      .from("reservas")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hace30dias),
    adminDb
      .from("reservas")
      .select("total")
      .eq("estado", "confirmada")
      .gte("created_at", hace30dias),
    adminDb.from("link_clicks").select("id", { count: "exact", head: true }),
    adminDb
      .from("campanas")
      .select("id", { count: "exact", head: true })
      .eq("activa", true),
    adminDb.from("servicios").select("id", { count: "exact", head: true }),
    adminDb.from("reservas").select("estudio_id").gte("created_at", hace30dias),
    adminDb.from("estudios").select("id, nombre"),
  ]);

  // 💰 Cálculo de Ingresos y Conversión
  const confirmadas = reservasConfirmadasMes.data || [];
  const ingresos = confirmadas.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0,
  );
  const totalReservasMes = reservasMes.count ?? 0;
  const tasaConversion =
    totalReservasMes > 0
      ? Math.round((confirmadas.length / totalReservasMes) * 100)
      : 0;

  // 🏆 Cálculo de Top Estudios (mapeo manual seguro)
  const nombrePorId = new Map(
    (estudiosCatalogo.data || []).map((e: { id: string; nombre: string }) => [
      e.id,
      e.nombre,
    ]),
  );
  const conteoPorEstudio: Record<string, { nombre: string; cantidad: number }> =
    {};

  (topEstudiosRes.data || []).forEach((r: { estudio_id: string }) => {
    const id = r.estudio_id;
    const nombre = nombrePorId.get(id) ?? "Estudio desconocido";
    if (!conteoPorEstudio[id]) conteoPorEstudio[id] = { nombre, cantidad: 0 };
    conteoPorEstudio[id].cantidad += 1;
  });

  const topEstudios = Object.values(conteoPorEstudio)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5); // Top 5

  // Formateador de moneda argentina
  const fmtARS = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
  const colorConv =
    tasaConversion >= 70 ? "emerald" : tasaConversion >= 40 ? "amber" : "pink";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Resumen general de la plataforma TurnosPro
        </p>
      </div>

      {/* Métricas principales (Ahora 6 tarjetas para incluir Ingresos y Conversión) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          titulo="Estudios"
          valor={totalEstudios.count ?? 0}
          icono="🏢"
          color="violet"
          detalle={`${estudiosNuevos.count ?? 0} nuevos esta semana`}
        />
        <MetricCard
          titulo="Reservas (30d)"
          valor={totalReservasMes}
          icono="📋"
          color="blue"
        />
        <MetricCard
          titulo="Ingresos (30d)"
          valor={fmtARS.format(ingresos)}
          icono="💰"
          color="emerald"
        />
        <MetricCard
          titulo="Conversión"
          valor={`${tasaConversion}%`}
          icono="📈"
          color={colorConv}
          detalle="Confirmadas / Totales"
        />
        <MetricCard
          titulo="Clicks en links"
          valor={totalClicks.count ?? 0}
          icono="🔗"
          color="amber"
          detalle="Tráfico generado"
        />
        <MetricCard
          titulo="Campañas activas"
          valor={campanasActivas.count ?? 0}
          icono="📣"
          color="pink"
          detalle={`${totalServicios.count ?? 0} servicios`}
        />
      </div>

      {/* Top estudios por reservas (Más valioso que "últimos registrados") */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          🏆 Top estudios por reservas (últimos 30 días)
        </h2>
        {topEstudios.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aún no hay reservas en los últimos 30 días.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-2 font-medium w-16">#</th>
                  <th className="pb-2 font-medium">Estudio</th>
                  <th className="pb-2 font-medium text-right">Reservas</th>
                  <th className="pb-2 font-medium w-1/3">Actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {topEstudios.map((e, i) => {
                  const max = topEstudios[0]?.cantidad ?? 1;
                  const porcentaje = (e.cantidad / max) * 100;
                  return (
                    <tr key={e.nombre} className="text-slate-200">
                      <td className="py-3 font-bold text-slate-500">{i + 1}</td>
                      <td className="py-3 font-medium">{e.nombre}</td>
                      <td className="py-3 text-right font-semibold text-white">
                        {e.cantidad}
                      </td>
                      <td className="py-3 align-middle">
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
