import { adminDb } from "@/lib/supabase/admin";
import CampanasClient from "./CampanasClient";

const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";

export default async function AdminCampanasPage() {
  const { data: campanas, error } = await adminDb
    .from("campanas")
    .select("*, combos(nombre), servicios(nombre)")
    .eq("estudio_id", ESTUDIO_ID)
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  const { data: combos } = await adminDb
    .from("combos")
    .select("id, nombre")
    .eq("estudio_id", ESTUDIO_ID)
    .eq("activo", true);

  const { data: servicios } = await adminDb
    .from("servicios")
    .select("id, nombre")
    .eq("estudio_id", ESTUDIO_ID)
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
