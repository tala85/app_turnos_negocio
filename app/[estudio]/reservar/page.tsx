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
      className="min-h-screen"
      style={{ backgroundColor: estudio.color_fondo }}
    >
      {/* ✅ Navbar superior: blanca, fija al scrollear, con botón y logo protagonistas */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 shadow-sm backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
          <div className="justify-self-start">
            {/* Izquierda: volver */}
            <Link
              href={`/${slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:-translate-x-0.5 hover:border-gray-300 hover:shadow-md"
            >
              <span aria-hidden>←</span>
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Inicio</span>
            </Link>
          </div>

          {/* ✅ Nombre GRANDE + slogan CHICO, en la misma línea */}
          <div className="flex min-w-0 items-baseline justify-center gap-3">
            <h1
              className="truncate text-2xl font-extrabold tracking-tight md:text-5xl"
              style={{ color: estudio.color_primario }}
            >
              {estudio.nombre}
            </h1>
            {estudio.slogan && (
              <p className="hidden truncate text-sm text-gray-500 sm:block md:text-base">
                {estudio.slogan}
              </p>
            )}
          </div>

          {/* Derecha: logo */}
          <div className="justify-self-end">
            {estudio.logo_url ? (
              <Image
                src={estudio.logo_url}
                alt={`Logo de ${estudio.nombre}`}
                width={160}
                height={56}
                className="h-11 w-auto object-contain md:h-14"
                unoptimized
              />
            ) : (
              <span
                className="text-lg font-extrabold"
                style={{ color: estudio.color_primario }}
              >
                💅
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:pt-8">
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
