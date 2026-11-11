import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";

// Obtener configuración del estudio desde el servidor
async function getConfiguracion() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data } = await supabase
      .from("estudios")
      .select(
        "nombre, logo_url, slogan, color_primario, color_secundario, color_fondo",
      )
      .eq("slug", "belleza-posadas")
      .single();

    return (
      data || {
        nombre: "Belleza Posadas",
        logo_url: null,
        slogan: "Tu belleza, nuestra pasión",
        color_primario: "#ec4899", // Rosa por defecto
        color_secundario: "#8b5cf6", // Violeta por defecto
        color_fondo: "#f9fafb", // Gris claro por defecto
      }
    );
  } catch {
    return {
      nombre: "Belleza Posadas",
      logo_url: null,
      slogan: "Tu belleza, nuestra pasión",
      color_primario: "#ec4899",
      color_secundario: "#8b5cf6",
      color_fondo: "#f9fafb",
    };
  }
}

export default async function HomePage() {
  const config = await getConfiguracion();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: config.color_fondo }}
    >
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {config.logo_url ? (
              <Image
                src={config.logo_url}
                alt="Logo"
                width={220}
                height={80}
                className="object-contain h-16 w-auto md:h-20"
                unoptimized
              />
            ) : (
              <h1
                className="text-2xl font-bold"
                style={{ color: config.color_primario }}
              >
                {config.nombre}
              </h1>
            )}
          </div>
         
        </div>
      </header>

      {/* Hero Section (Bienvenida) */}
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Slogan destacado */}
          <div className="space-y-4">
            <h2
              className="text-4xl md:text-6xl font-extrabold tracking-tight"
              style={{ color: config.color_primario }}
            >
              {config.nombre}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto">
              {config.slogan ||
                "Reservá tu turno de forma rápida, fácil y segura."}
            </p>
          </div>

          {/* Beneficios rápidos */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-bold text-gray-800 mb-2">Elegí tu horario</h3>
              <p className="text-gray-600 text-sm">
                Visualizá los turnos disponibles en tiempo real y elegí el que
                mejor te quede.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">💳</div>
              <h3 className="font-bold text-gray-800 mb-2">Reservá con seña</h3>
              <p className="text-gray-600 text-sm">
                Asegurá tu lugar pagando solo una pequeña seña a través de
                MercadoPago.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold text-gray-800 mb-2">
                Confirmación inmediata
              </h3>
              <p className="text-gray-600 text-sm">
                Recibí la confirmación de tu turno al instante por WhatsApp.
              </p>
            </div>
          </div>

          {/* Botón de acción principal (CTA) */}
          <div className="pt-8">
            <Link
              href="/belleza-posadas/reservar"
              className="inline-block px-10 py-4 rounded-full text-white text-lg font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: config.color_primario,
                boxShadow: `0 10px 25px -5px ${config.color_primario}66`, // Sombra con el mismo color
              }}
            >
              ✨ Reservar mi turno ahora
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Sin registros complicados. Solo elegí, reservá y listo.
            </p>
          </div>
        </div>
      </main>

      {/* Footer simple */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {config.nombre}. Todos los derechos
            reservados.
          </p>
          <Link
            href="/admin/login"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Acceso Administración
          </Link>
        </div>
      </footer>
    </div>
  );
}
