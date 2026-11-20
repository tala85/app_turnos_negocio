"use client";

import { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useTema } from "@/lib/admin/tema";
import { QRCodeSVG } from "qrcode.react";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

type Estadistica = {
  origen: string;
  cantidad: number;
};

export default function AdminCompartirPage() {
  const tema = useTema();
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [origenSeleccionado, setOrigenSeleccionado] = useState("whatsapp");
  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [slug, setSlug] = useState<string>(""); // ✅ Nuevo: para armar el link público

  // Función reutilizable para el botón "Actualizar"
  const cargarStats = useCallback(async () => {
    try {
      // ✅ Sin estudioId: el servidor lo deriva de la sesión
      const res = await fetch("/api/admin/estadisticas-links");
      const data = await res.json();
      if (data.ok) {
        setEstadisticas(data.data);
        const total = data.data.reduce(
          (acc: number, curr: Estadistica) => acc + curr.cantidad,
          0,
        );
        setTotalClicks(total);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  }, []);

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        // 1. Obtenemos la config para tener el slug (para generar el link público correcto)
        const resConfig = await fetch("/api/admin/configuracion");
        const dataConfig = await resConfig.json();

        // 2. Obtenemos las estadísticas (el servidor ya sabe el estudio por la sesión)
        const resStats = await fetch("/api/admin/estadisticas-links");
        const dataStats = await resStats.json();

        if (!cancelado) {
          if (dataConfig.ok) setSlug(dataConfig.data.slug);
          if (dataStats.ok) {
            setEstadisticas(dataStats.data);
            const total = dataStats.data.reduce(
              (acc: number, curr: Estadistica) => acc + curr.cantidad,
              0,
            );
            setTotalClicks(total);
          }
        }
      } catch (error) {
        console.error("Error cargando:", error);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  // ✅ Link profesional: /belleza-posadas/reservar?origen=whatsapp
  const generarLink = (origen: string) => {
    if (slug) {
      return `${BASE_URL}/${slug}/reservar?origen=${origen}`;
    }
    return `${BASE_URL}/api/r?o=${origen}`; // Fallback por si acaso
  };

  const copiarAlPortapapeles = async () => {
    const link = generarLink(origenSeleccionado);
    await navigator.clipboard.writeText(link);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  const compartirWhatsApp = () => {
    const link = generarLink("whatsapp");
    const texto = `✨ *Reservá tu turno online en nuestro estudio*\n\nElegí el servicio, el horario y asegurá tu lugar con una pequeña seña.\n\n👉 Reservar aquí: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const descargarQR = () => {
    const svg = document.querySelector<SVGSVGElement>("#qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-reservas-${origenSeleccionado}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const iconosOrigen: Record<string, string> = {
    whatsapp: "📱 WhatsApp",
    instagram: "📸 Instagram",
    facebook: "👍 Facebook",
    qr: "🖨️ Código QR",
    directo: "🔗 Link Directo",
  };

  return (
    <div
      className={`min-h-screen ${tema.bg} ${tema.texto} transition-colors duration-300`}
    >
      <div className="mx-auto max-w-5xl px-3 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        <AdminHeader
          tema={tema}
          icono="📢"
          titulo="Compartir y Promocionar"
          subtitulo="Generá links de seguimiento y atraé nuevos clientes"
          links={[
            {
              href: "/admin/reservas",
              label: "Reservas",
              icono: "📋",
              color: "emerald",
            },
            {
              href: "/admin/campanas",
              label: "Campañas",
              icono: "📣",
              color: "fuchsia",
            },
            {
              href: "/admin/configuracion",
              label: "Configuración",
              icono: "🎨",
              color: "fuchsia",
            },
          ]}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* COLUMNA IZQUIERDA: Generador de Links */}
          <section
            className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-6 shadow-sm`}
          >
            <h2
              className={`text-lg font-semibold tracking-tight ${tema.texto} mb-4`}
            >
              🔗 Generar Link de Reserva
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-medium uppercase tracking-wide ${tema.texto2} mb-2`}
                >
                  ¿Dónde lo vas a compartir?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(iconosOrigen).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setOrigenSeleccionado(key)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        origenSeleccionado === key
                          ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400"
                          : `${tema.borde} ${tema.texto2} hover:bg-gray-100 dark:hover:bg-gray-800`
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label
                  className={`block text-xs font-medium uppercase tracking-wide ${tema.texto2} mb-2`}
                >
                  Tu link de seguimiento
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generarLink(origenSeleccionado)}
                    className={`flex-1 h-10 rounded-lg border px-3 text-sm font-mono ${tema.input}`}
                  />
                  <button
                    onClick={copiarAlPortapapeles}
                    className={`h-10 px-4 rounded-lg text-sm font-medium transition-all ${
                      linkCopiado ? "bg-green-500 text-white" : tema.btnPrimario
                    }`}
                  >
                    {linkCopiado ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              {origenSeleccionado === "whatsapp" && (
                <button
                  onClick={compartirWhatsApp}
                  className="w-full h-12 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <span>📱</span> Compartir en WhatsApp ahora
                </button>
              )}

              {origenSeleccionado === "qr" && (
                <div className="flex flex-col items-center pt-4 space-y-3">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <QRCodeSVG
                      id="qr-code"
                      value={generarLink("qr")}
                      size={180}
                      level="H"
                    />
                  </div>
                  <button
                    onClick={descargarQR}
                    className={`h-10 px-6 rounded-lg text-sm font-medium ${tema.btnNeutro}`}
                  >
                    ⬇️ Descargar imagen QR
                  </button>
                  <p className={`text-xs ${tema.texto2} text-center`}>
                    Imprimilo y pegalo en el mostrador o en tarjetas.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* COLUMNA DERECHA: Estadísticas */}
          <section
            className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-6 shadow-sm`}
          >
            <h2
              className={`text-lg font-semibold tracking-tight ${tema.texto} mb-4`}
            >
              📊 Rendimiento de Links
            </h2>

            <button
              onClick={cargarStats}
              className={`mb-4 h-9 px-4 rounded-lg text-xs font-medium ${tema.btnNeutro}`}
            >
              🔄 Actualizar estadísticas
            </button>

            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10 border border-pink-500/20">
              <p className={`text-sm ${tema.texto2}`}>
                Total de personas que hicieron click
              </p>
              <p className="text-4xl font-bold text-pink-600 dark:text-pink-400 mt-1">
                {totalClicks}
              </p>
            </div>

            <div className="space-y-3">
              {estadisticas.length === 0 ? (
                <p className={`text-center py-8 text-sm ${tema.texto2}`}>
                  Aún no hay clicks registrados. ¡Compartí tu primer link!
                </p>
              ) : (
                estadisticas.map((stat) => {
                  const porcentaje =
                    totalClicks > 0
                      ? Math.round((stat.cantidad / totalClicks) * 100)
                      : 0;
                  return (
                    <div key={stat.origen} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={`font-medium ${tema.texto}`}>
                          {iconosOrigen[stat.origen] || stat.origen}
                        </span>
                        <span className={tema.texto2}>
                          {stat.cantidad} clicks ({porcentaje}%)
                        </span>
                      </div>
                      <div
                        className={`h-2 rounded-full ${tema.oscuro ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-full transition-all duration-500"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
