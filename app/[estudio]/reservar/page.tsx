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

// Generar rutas estáticas
export async function generateStaticParams() {
  try {
    const { data: estudios } = await supabase.from("estudios").select("slug");
    return estudios?.map((e) => ({ estudio: e.slug })) ?? [];
  } catch {
    return [];
  }
}

export const dynamicParams = true;

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ estudio: string }>;
}) {
  const { estudio: slug } = await params;

  // ✅ Cargamos el estudio por su slug REAL (no hardcodeado)
  const { data: estudio } = await supabase
    .from("estudios")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!estudio) notFound();

  // ✅ La config YA viene dentro de 'estudio' (colores, logo, slogan, etc.)
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
      style={{ backgroundColor: estudio.color_fondo }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header con botón volver */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Volver al inicio</span>
          </Link>

          {estudio.logo_url && (
            <Image
              src={estudio.logo_url}
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
            style={{ color: estudio.color_primario }}
          >
            {estudio.nombre}
          </h1>
          {estudio.slogan && (
            <p className="text-gray-600 mt-2">{estudio.slogan}</p>
          )}
        </div>

        {/* Formulario de reserva */}
        <ReservaForm
          estudioId={estudio.id}
          servicios={servicios || []}
          combos={combos || []}
          colores={{
            primario: estudio.color_primario,
            secundario: estudio.color_secundario,
            fondo: estudio.color_fondo,
          }}
        />
      </div>
    </main>
  );
}
