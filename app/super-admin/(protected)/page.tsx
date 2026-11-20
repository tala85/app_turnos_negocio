import { adminDb } from "@/lib/supabase/admin";
import MetricCard from "@/components/super-admin/MetricCard";

// ✅ Calcular fechas FUERA del componente para evitar impureza en el render
const hoy = new Date().toISOString().slice(0, 10);
const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

export default async function SuperAdminDashboard() {
  // ✅ Cargar métricas globales de TODOS los estudios
  const [
    totalEstudios,
    estudiosNuevos,
    totalReservas,
    reservasHoy,
    totalClicks,
    campanasActivas,
    totalServicios,
  ] = await Promise.all([
    adminDb.from("estudios").select("id", { count: "exact", head: true }),
    adminDb
      .from("estudios")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hace7dias),
    adminDb.from("reservas").select("id", { count: "exact", head: true }),
    adminDb
      .from("reservas")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hoy),
    adminDb.from("link_clicks").select("id", { count: "exact", head: true }),
    adminDb
      .from("campanas")
      .select("id", { count: "exact", head: true })
      .eq("activa", true),
    adminDb.from("servicios").select("id", { count: "exact", head: true }),
  ]);

  // Últimos 5 estudios registrados
  const { data: ultimosEstudios } = await adminDb
    .from("estudios")
    .select("id, nombre, slug, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Resumen general de la plataforma TurnosPro
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          titulo="Estudios registrados"
          valor={totalEstudios.count ?? 0}
          icono="🏢"
          color="pink"
          detalle={`${estudiosNuevos.count ?? 0} nuevos esta semana`}
        />
        <MetricCard
          titulo="Reservas totales"
          valor={totalReservas.count ?? 0}
          icono="📋"
          color="blue"
          detalle={`${reservasHoy.count ?? 0} hoy`}
        />
        <MetricCard
          titulo="Clicks en links"
          valor={totalClicks.count ?? 0}
          icono="🔗"
          color="emerald"
          detalle="Tráfico generado"
        />
        <MetricCard
          titulo="Campañas activas"
          valor={campanasActivas.count ?? 0}
          icono="📣"
          color="amber"
          detalle={`${totalServicios.count ?? 0} servicios creados`}
        />
      </div>

      {/* Últimos estudios registrados */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          🆕 Últimos estudios registrados
        </h2>
        {!ultimosEstudios || ultimosEstudios.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aún no hay estudios registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Slug</th>
                  <th className="pb-2 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ultimosEstudios.map((e) => (
                  <tr key={e.id} className="text-slate-200">
                    <td className="py-3 font-medium">{e.nombre}</td>
                    <td className="py-3">
                      <code className="text-xs bg-slate-800 px-2 py-1 rounded">
                        /{e.slug}
                      </code>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(e.created_at).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
