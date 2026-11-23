import { adminDb } from "@/lib/supabase/admin";

export default async function SuperAdminActividad() {
  const [{ data: estudios }, { data: reservas }] = await Promise.all([
    adminDb.from("estudios").select("nombre, slug, created_at").order("created_at", { ascending: false }).limit(8),
    adminDb.from("reservas").select("cliente_nombre, cliente_apellido, estado, total, inicio").order("inicio", { ascending: true }).limit(8),
  ]);

  const fmt = (s: string) => new Date(s).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtHora = (iso: string) => { const m = iso.match(/T(\d{2}):(\d{2})/); return m ? `${m[1]}:${m[2]}` : ""; };

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-white mb-1">Actividad</h1>
      <p className="text-gray-400 mb-8">Lo último que pasa en la plataforma</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Nuevos estudios */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">🏪 Últimos estudios registrados</h2>
          <div className="space-y-3">
            {estudios?.map((e) => (
              <div key={e.slug} className="flex items-center justify-between py-2 border-b border-gray-800/60 last:border-0">
                <div>
                  <p className="text-white font-medium">{e.nombre}</p>
                  <p className="text-gray-500 text-xs">/{e.slug}</p>
                </div>
                <span className="text-gray-400 text-xs">{fmt(e.created_at)}</span>
              </div>
            ))}
            {(!estudios || estudios.length === 0) && <p className="text-gray-500 text-sm">Sin registros aún.</p>}
          </div>
        </section>

        {/* Próximas reservas */}
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">📅 Próximas reservas</h2>
          <div className="space-y-3">
            {reservas?.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/60 last:border-0">
                <div>
                  <p className="text-white font-medium">{r.cliente_nombre} {r.cliente_apellido}</p>
                  <p className="text-gray-500 text-xs">{fmt(r.inicio)} · {fmtHora(r.inicio)} · ${Number(r.total).toLocaleString("es-AR")}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${r.estado === "pagada" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{r.estado}</span>
              </div>
            ))}
            {(!reservas || reservas.length === 0) && <p className="text-gray-500 text-sm">Sin reservas aún.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}