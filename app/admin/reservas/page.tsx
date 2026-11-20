import { redirect } from "next/navigation";
import { adminDb } from "@/lib/supabase/admin";
import { obtenerEstudioDeSesion } from "@/lib/auth";
import ReservasClient from "./ReservasClient";

const ESTUDIO_DEFAULT_SLUG = "belleza-posadas";

export default async function AdminReservasPage() {
  // 1. Verificar sesión: si no hay, redirigir al login del estudio
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) {
    redirect(`/${ESTUDIO_DEFAULT_SLUG}/admin/login`);
  }

  // 2. Cargar SOLO las reservas de ese estudio (aislamiento real)
  const { data: reservas, error } = await adminDb
    .from("reservas")
    .select("*")
    .eq("estudio_id", estudioId) // ← FILTRO DE TENANT
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Error al cargar reservas
          </h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // 3. Pasar el estudioId al cliente (en vez de la constante hardcodeada)
  return <ReservasClient reservas={reservas || []} estudioId={estudioId} />;
}
