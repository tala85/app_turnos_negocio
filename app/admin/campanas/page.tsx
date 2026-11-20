import { redirect } from "next/navigation";
import { adminDb } from "@/lib/supabase/admin";
import { obtenerEstudioDeSesion } from "@/lib/auth";
import CampanasClient from "./CampanasClient";

const ESTUDIO_DEFAULT_SLUG = "belleza-posadas";

export default async function AdminCampanasPage() {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) redirect(`/${ESTUDIO_DEFAULT_SLUG}/admin/login`);

  const { data: campanas, error } = await adminDb
    .from("campanas")
    .select("*, combos(nombre), servicios(nombre)")
    .eq("estudio_id", estudioId)
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  const { data: combos } = await adminDb
    .from("combos")
    .select("id, nombre")
    .eq("estudio_id", estudioId)
    .eq("activo", true);

  const { data: servicios } = await adminDb
    .from("servicios")
    .select("id, nombre")
    .eq("estudio_id", estudioId)
    .eq("activo", true);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Error al cargar campañas
        </h1>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  return (
    <CampanasClient
      campanas={campanas || []}
      combos={combos || []}
      servicios={servicios || []}
    />
  );
}
