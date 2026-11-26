import { adminDb } from "@/lib/supabase/admin";
import AccionesEstudio from "./AccionesEstudio";

export default async function SuperAdminEstudiosPage() {
  const { data: estudios, error } = await adminDb
    .from("estudios")
    .select("id, nombre, slug, email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-300">
        Error al cargar estudios: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Estudios</h1>
        <p className="text-slate-400">
          Todos los estudios registrados en la plataforma. Click en
          <strong> &apos;Ver panel&apos;</strong> para entrar como soporte.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-800 bg-slate-900/50">
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">Registrado</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {estudios && estudios.length > 0 ? (
              estudios.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {e.nombre}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs"></td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                      /{e.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(e.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <AccionesEstudio estudioId={e.id} nombre={e.nombre} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  Aún no hay estudios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
