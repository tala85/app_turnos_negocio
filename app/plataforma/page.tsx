import Link from "next/link";

export default function PlataformaPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 selection:bg-rose-100 selection:text-rose-900">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-100 bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-rose-500 text-white shadow-lg shadow-rose-500/20">
              💅
            </span>
            <span>
              Turnos
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-rose-500">
                Pro
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-gray-900/20"
            >
              Crear mi estudio
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-violet-200/25 to-rose-200/25 rounded-full blur-3xl -z-10" />

        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Nuevo: Recordatorios automáticos por WhatsApp
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-gray-900">
            Tus clientas reservan solas.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-rose-500">
              Vos, te dedicás a atenderlas.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tu propia página de reservas con tu marca, cobro de seña online con
            MercadoPago y un panel de control simple. Olvidate de los
            &ldquo;no-shows&rdquo; para siempre.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/registro"
              className="group bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-full shadow-xl shadow-gray-900/10 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              🚀 Crear mi estudio gratis
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <Link
              href="/estudio-demo/reservar"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold px-8 py-4 rounded-full transition-all hover:border-rose-200 hover:text-rose-600 flex items-center justify-center gap-2"
            >
              <span>👁️</span> Ver demo en vivo
            </Link>
          </div>

          {/* Mockup del panel admin (réplica visual con Tailwind) */}
          <div className="relative mx-auto max-w-5xl bg-slate-800 rounded-2xl shadow-2xl shadow-violet-900/20 border border-slate-700 p-2 sm:p-3 transform rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] flex relative">
              {/* Sidebar */}
              <div className="w-16 sm:w-48 bg-slate-950 border-r border-slate-800 p-3 sm:p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  <span className="hidden sm:block text-white font-bold text-sm">
                    TurnosPro
                  </span>
                </div>
                {[
                  "📊 Dashboard",
                  "📋 Reservas",
                  "🕒 Horarios",
                  "💅 Servicios",
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${i === 0 ? "bg-violet-600/20 text-violet-300" : "text-slate-400"}`}
                  >
                    <span className="text-sm">{item.split(" ")[0]}</span>
                    <span className="hidden sm:block">
                      {item.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Área principal */}
              <div className="flex-1 p-3 sm:p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="h-3 w-24 bg-slate-700 rounded mb-1.5" />
                    <div className="h-2 w-32 bg-slate-800 rounded" />
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-amber-400/20" />
                </div>

                {/* Cards de métricas */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                  {[
                    {
                      label: "Reservas hoy",
                      val: "12",
                      color: "from-violet-500 to-violet-700",
                    },
                    {
                      label: "Ingresos",
                      val: "$45.000",
                      color: "from-rose-500 to-rose-700",
                    },
                    {
                      label: "Confirmadas",
                      val: "8",
                      color: "from-emerald-500 to-emerald-700",
                    },
                    {
                      label: "Tasa",
                      val: "67%",
                      color: "from-amber-500 to-amber-700",
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-br ${c.color} rounded-lg p-2 sm:p-3`}
                    >
                      <div className="text-[10px] sm:text-xs text-white/80 mb-1">
                        {c.label}
                      </div>
                      <div className="text-sm sm:text-xl font-bold text-white">
                        {c.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tabla de reservas */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="h-2.5 w-20 bg-slate-600 rounded mb-3" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700" />
                          <div>
                            <div className="h-2 w-16 bg-slate-600 rounded mb-1" />
                            <div className="h-1.5 w-24 bg-slate-700 rounded" />
                          </div>
                        </div>
                        <div className="h-4 w-12 rounded bg-emerald-500/20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tu estudio online en 3 pasos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sin conocimientos técnicos. Sin instalaciones. Solo tu celular o
              computadora.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                paso: "1",
                titulo: "Creá tu cuenta",
                desc: "Elegí el nombre de tu estudio y una contraseña. Tu link único se genera al instante.",
              },
              {
                paso: "2",
                titulo: "Cargá tus servicios",
                desc: "Agregá tus tratamientos, precios y duración. Configurá tus horarios de atención.",
              },
              {
                paso: "3",
                titulo: "Compartí tu link",
                desc: "Pegá tu link en tu Instagram, WhatsApp o Facebook. Tus clientas reservan y pagan la seña solas.",
              },
            ].map((item) => (
              <div
                key={item.paso}
                className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="absolute -top-4 left-8 bg-gradient-to-br from-violet-600 to-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-rose-500/20">
                  {item.paso}
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3 mt-2">
                  {item.titulo}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-slate-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que tu estudio necesita
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dejá de usar planillas de Excel y agendas de papel. Profesionalizá
              tu gestión hoy.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icono: "📅",
                titulo: "Reservas 24/7",
                texto:
                  "Tus clientas eligen servicio, día y horario desde el celular, sin llamarte ni escribirte.",
              },
              {
                icono: "💳",
                titulo: "Seña con MercadoPago",
                texto:
                  "Asegurá el turno cobrando una seña online. Menos ausencias, más ingresos garantizados.",
              },
              {
                icono: "🔔",
                titulo: "Recordatorios auto",
                texto:
                  "Notificaciones push y WhatsApp automáticos para que nadie olvide su turno.",
              },
              {
                icono: "📢",
                titulo: "Promos y jornadas",
                texto:
                  "Creá campañas con días puntuales (ej: '20% off los martes') y banners en tu página.",
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
                  "Reservas del día, ingresos, estadísticas de clicks y actividad reciente en tiempo real.",
              },
            ].map((f) => (
              <div
                key={f.titulo}
                className="group bg-gray-50 hover:bg-white rounded-2xl p-6 border border-gray-100 hover:border-rose-100 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {f.icono}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {f.titulo}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Un plan simple y transparente
          </h2>
          <p className="text-gray-600 mb-12">
            Sin costos ocultos. Sin contratos. Empezá gratis y escalá cuando
            quieras.
          </p>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              MÁS POPULAR
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Plan Esencial
            </h3>
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-5xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-500 font-medium">/ mes</span>
            </div>
            <ul className="text-left max-w-sm mx-auto space-y-4 mb-8">
              {[
                "Reservas ilimitadas",
                "Cobro de seña con MercadoPago",
                "Página personalizada con tu logo",
                "Recordatorios automáticos",
                "Soporte por WhatsApp",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/registro"
              className="block w-full sm:w-auto mx-auto bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-full transition-all hover:shadow-lg"
            >
              Empezar ahora — es gratis
            </Link>
            <p className="text-xs text-gray-400 mt-4">
              No requiere tarjeta de crédito para registrarte.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-slate-100">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative bg-gradient-to-br from-violet-600 to-rose-600 rounded-3xl px-8 py-16 sm:px-16 sm:py-20 text-center text-white overflow-hidden shadow-2xl shadow-rose-600/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                Tu agenda llena, tu mente tranquila.
              </h2>
              <p className="text-rose-100 mb-10 max-w-2xl mx-auto text-lg">
                Unite a los estudios de belleza que ya automatizaron sus
                reservas. Configurarlo toma menos de 5 minutos.
              </p>
              <Link
                href="/registro"
                className="inline-block bg-white text-rose-600 font-bold px-10 py-4 rounded-full hover:bg-rose-50 transition-all hover:scale-105 shadow-xl"
              >
                Crear mi estudio gratis ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span className="text-xl">💅</span>
            <span>TurnosPro</span>
          </div>
          <p className="text-sm text-gray-500 text-center md:text-right">
            © {new Date().getFullYear()} TurnosPro. Sistema de reservas para
            estudios de belleza.
            <br />
            Hecho con ❤️ en Posadas, Misiones, Argentina.
          </p>
        </div>
      </footer>
    </div>
  );
}
