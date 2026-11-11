import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReservaForm from "@/components/ReservaForm";

// Cliente público para lecturas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Obtener configuración de la estética
async function getConfiguracion() {
  const { data } = await supabase
    .from("estudios")
    .select(
      "color_primario, color_secundario, color_fondo, logo_url, nombre, slogan",
    )
    .eq("slug", "belleza-posadas")
    .single();

  return (
    data || {
      color_primario: "#ec4899",
      color_secundario: "#8b5cf6",
      color_fondo: "#f9fafb",
      logo_url: null,
      nombre: "Belleza Posadas",
      slogan: "",
    }
  );
}

// Generar rutas estáticas
export async function generateStaticParams() {
  try {
    const { data: estudios } = await supabase.from("estudios").select("slug");

    return (
      estudios?.map((e) => ({ estudio: e.slug })) ?? [
        { estudio: "belleza-posadas" },
      ]
    );
  } catch {
    return [{ estudio: "belleza-posadas" }];
  }
}

export const dynamicParams = true;

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ estudio: string }>;
}) {
  const { estudio: slug } = await params;

  // Cargar estudio y configuración en paralelo
  const [estudioResult, config] = await Promise.all([
    supabase.from("estudios").select("*").eq("slug", slug).single(),
    getConfiguracion(),
  ]);

  const estudio = estudioResult.data;

  if (!estudio) {
    notFound();
  }

  const [{ data: servicios }, { data: combos }] = await Promise.all([
    supabase
      .from("servicios")
      .select("*")
      .eq("estudio_id", estudio.id)
      .eq("activo", true)
      .order("orden"),
    supabase
      .from("combos")
      .select("*, combo_servicios(servicio_id)")
      .eq("estudio_id", estudio.id)
      .eq("activo", true),
  ]);

  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: config.color_fondo }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header con botón volver */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Volver al inicio</span>
          </Link>

          {config.logo_url && (
            <Image
              src={config.logo_url}
              alt="Logo"
              width={150}
              height={50}
              className="h-12 w-auto object-contain"
              unoptimized
            />
          )}
        </div>

        {/* Título */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{ color: config.color_primario }}
          >
            {estudio.nombre}
          </h1>
          {config.slogan && (
            <p className="text-gray-600 mt-2">{config.slogan}</p>
          )}
        </div>

        {/* Formulario de reserva */}
        <ReservaForm
          estudioId={estudio.id}
          servicios={servicios || []}
          combos={combos || []}
          colores={{
            primario: config.color_primario,
            secundario: config.color_secundario,
            fondo: config.color_fondo,
          }}
        />
      </div>
    </main>
  );
}
