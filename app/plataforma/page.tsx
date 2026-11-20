import Link from "next/link";

export default function PlataformaPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAVBAR */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">💅</span>
            <span>
              Turnos<span className="text-pink-600">Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/belleza-posadas/admin/login"
              className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="text-sm font-semibold bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Crear mi estudio
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full mb-6">
          Para estudios de belleza y estética
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Tus clientas reservan solas.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-violet-600">
            Vos, te dedicás a atenderlas.
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Página de reservas con tu marca, cobro de seña online con
          MercadoPago, recordatorios automáticos y un panel para gestionar
          turnos, servicios y promociones. Todo en un solo lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/registro"
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-pink-600/20 transition-all hover:scale-[1.02]"
          >
            🚀 Crear mi estudio gratis
          </Link>
          <Link
            href="/belleza-posadas/reservar"
            className="border-2 border-gray-200 hover:border-pink-600 text-gray-700 hover:text-pink-600 font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Ver una demo en vivo
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Todo lo que tu estudio necesita
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icono: "📅",
                titulo: "Reservas 24/7",
                texto:
                  "Tus clientas eligen servicio, día y horario desde el celular, sin llamarte.",
              },
              {
                icono: "💳",
                titulo: "Seña con MercadoPago",
                texto:
                  "Asegurá el turno cobrando una seña online. Menos ausencias, más ingresos.",
              },
              {
                icono: "🔔",
                titulo: "Recordatorios automáticos",
                texto:
                  "Notificaciones push y WhatsApp para que nadie olvide su turno.",
              },
              {
                icono: "📢",
                titulo: "Promos y jornadas",
                texto:
                  "Creá campañas con días puntuales (ej: 2 domingos) y banners en tu página.",
              },
              {
                icono: "🎨",
                titulo: "Tu marca, tu estilo",
                texto:
                  "Logo, colores y datos de contacto personalizados. Se ve como tuyo, porque es tuyo.",
              },
              {
                icono: "📊",
                titulo: "Panel de control",
                texto:
                  "Reservas, ingresos del día, estadísticas de links y actividad reciente.",
              },
            ].map((f) => (
              <div
                key={f.titulo}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icono}</div>
                <h3 className="font-semibold text-lg mb-2">{f.titulo}</h3>
                <p className="text-sm text-gray-600">{f.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-pink-600 to-violet-700 rounded-3xl px-8 py-16 text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            En menos de 1 minuto tenés tu espacio
          </h2>
          <p className="text-pink-100 mb-8 max-w-xl mx-auto">
            Elegí el nombre de tu estudio, creá tu contraseña y listo. Tu link
            de reservas queda activo al instante.
          </p>
          <Link
            href="/registro"
            className="inline-block bg-white text-pink-700 font-bold px-8 py-4 rounded-xl hover:bg-pink-50 transition-colors shadow-lg"
          >
            Empezar ahora — es gratis
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        <p>
          TurnosPro · Sistema de reservas para estudios de belleza · Posadas,
          Misiones
        </p>
      </footer>
    </div>
  );
}