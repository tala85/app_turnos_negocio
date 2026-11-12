import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import RedesSociales from "@/components/ui/RedesSociales";

async function getConfiguracion() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data } = await supabase
      .from("estudios")
      .select(
        "nombre, logo_url, slogan, color_primario, color_secundario, color_fondo, whatsapp, direccion, instagram, facebook",
      )
      .eq("slug", "belleza-posadas")
      .single();

    return (
      data || {
        nombre: "Belleza Posadas",
        logo_url: null,
        slogan: "Tu belleza, nuestra pasión",
        color_primario: "#ec4899",
        color_secundario: "#8b5cf6",
        color_fondo: "#fafafa",
        whatsapp: "",
        direccion: "",
        instagram: "",
        facebook: "",
      }
    );
  } catch {
    return {
      nombre: "Belleza Posadas",
      logo_url: null,
      slogan: "Tu belleza, nuestra pasión",
      color_primario: "#ec4899",
      color_secundario: "#8b5cf6",
      color_fondo: "#fafafa",
      whatsapp: "",
      direccion: "",
      instagram: "",
      facebook: "",
    };
  }
}

export default async function HomePage() {
  const config = await getConfiguracion();
  const slug = "belleza-posadas";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: config.color_fondo }}
    >
      {/* Header minimalista */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            {config.logo_url ? (
              <Image
                src={config.logo_url}
                alt={`Logo ${config.nombre}`}
                width={140}
                height={50}
                className="object-contain h-10 w-auto md:h-12"
                priority
                unoptimized
              />
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: config.color_primario }}
              >
                {config.nombre}
              </span>
            )}
          </Link>
          <Link
            href="/admin/login"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            🔒 Acceso Staff
          </Link>
        </div>
      </header>

      {/* Hero en formato split: logo a la izquierda, texto a la derecha */}
      <main className="flex-grow flex items-center px-4 py-10 md:py-16 bg-gradient-to-br from-white via-white to-gray-50">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* COLUMNA IZQUIERDA: Logo protagonista */}
          <div className="flex justify-center order-1 md:order-none">
            <div
              className="bg-white rounded-3xl p-8 md:p-12 shadow-xl"
              style={{
                boxShadow: `0 25px 50px -12px ${config.color_primario}40`,
              }}
            >
              <Image
                src={config.logo_url || ""}
                alt={`Logo ${config.nombre}`}
                width={320}
                height={320}
                className="object-contain w-52 h-52 md:w-64 md:h-64"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* COLUMNA DERECHA: Título, slogan y CTA */}
          <div className="text-center md:text-left space-y-6 order-2 md:order-none">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-white/80 border border-gray-200 shadow-sm">
              ✨ Experiencia premium de belleza
            </span>

            <h2
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
              style={{ color: config.color_primario }}
            >
              {config.nombre}
            </h2>

            <p className="text-lg md:text-2xl text-gray-600 font-medium leading-relaxed">
              {config.slogan ||
                "Reservá tu turno de forma rápida, fácil y segura."}
            </p>

            {/* CTA principal movido acá para que esté a la vista */}
            <div className="pt-2">
              <Link
                href={`/${slug}/reservar`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-lg font-bold shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                style={{
                  backgroundColor: config.color_primario,
                  boxShadow: `0 20px 25px -5px ${config.color_primario}50`,
                }}
              >
                ✨ Reservar mi turno ahora
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                Sin registros complicados. Solo elegí y listo.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Franja separadora con el color primario */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: config.color_primario }}
      />

      {/* Beneficios: los separamos del hero para que tengan su propio espacio */}
      <section className="px-4 pb-16 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: "📅",
              title: "Elegí tu horario",
              desc: "Visualizá los turnos disponibles en tiempo real.",
            },
            {
              icon: "💳",
              title: "Seña segura",
              desc: "Asegurá tu lugar con MercadoPago.",
            },
            {
              icon: "📱",
              title: "Confirmación al instante",
              desc: "Recibí los detalles directamente en tu WhatsApp.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer con logo + redes */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center md:text-left items-start">
          {/* Columna 1: Logo + nombre */}
          <div className="flex flex-col items-center md:items-start gap-3">
            {config.logo_url ? (
              <Image
                src={config.logo_url}
                alt={`Logo ${config.nombre}`}
                width={140}
                height={60}
                className="object-contain h-14 w-auto"
                unoptimized
              />
            ) : (
              <h4
                className="font-bold text-lg"
                style={{ color: config.color_primario }}
              >
                {config.nombre}
              </h4>
            )}
            {config.direccion && (
              <p className="text-sm text-gray-600">{config.direccion}</p>
            )}
          </div>

          {/* Columna 2: Contacto */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-gray-900 mb-2">Contacto</h4>
            {config.whatsapp && (
              <a
                href={`https://wa.me/54${config.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors"
              >
                WhatsApp: +54 {config.whatsapp}
              </a>
            )}
          </div>

          {/* Columna 3: Redes */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="font-bold text-gray-900 mb-2">Seguinos</h4>
            <RedesSociales
              instagram={config.instagram}
              facebook={config.facebook}
              whatsapp={config.whatsapp}
              size="md"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {config.nombre}. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>

      {/* Botón flotante WhatsApp */}
      {config.whatsapp && (
        <a
          href={`https://wa.me/54${config.whatsapp}?text=Hola!%20Quisiera%20consultar%20por%20un%20turno`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Contactar por WhatsApp"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            ¡Chateá con nosotros!
          </span>
        </a>
      )}
    </div>
  );
}
