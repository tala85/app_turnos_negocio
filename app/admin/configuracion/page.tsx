"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminHeader from "@/components/admin/AdminHeader";
import { Toaster, useToast } from "@/lib/admin/useToast";
import { useTema } from "@/lib/admin/tema";

type Configuracion = {
  id: string;
  nombre: string;
  slug: string;
  logo_url: string | null;
  slogan: string | null;
  color_primario: string;
  color_secundario: string;
  color_fondo: string;
  whatsapp?: string;
  direccion?: string;
  instagram?: string;
  facebook?: string;
};

const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";

export default function AdminConfiguracionPage() {
  const tema = useTema();
  const { toast, mostrar, cerrar } = useToast();

  const [config, setConfig] = useState<Configuracion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cargar = async () => {
      try {
        const res = await fetch(
          `/api/admin/configuracion?estudioId=${ESTUDIO_ID}`,
        );
        const data = await res.json();
        if (data.ok && isMounted) {
          setConfig(data.data);
          setPreviewLogo(data.data.logo_url || "");
        }
      } catch {
        console.error("Error cargando configuración");
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargar();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1048576) {
      mostrar({ tipo: "error", texto: "El logo no puede pesar más de 1 MB" });
      return;
    }
    setLogoFile(file);
    setPreviewLogo(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setGuardando(true);

    const formData = new FormData();
    formData.append("estudioId", ESTUDIO_ID);
    formData.append("nombre", config.nombre || "");
    formData.append("slogan", config.slogan || "");
    formData.append("colorPrimario", config.color_primario);
    formData.append("colorSecundario", config.color_secundario);
    formData.append("colorFondo", config.color_fondo);
    formData.append("whatsapp", config.whatsapp || "");
    formData.append("direccion", config.direccion || "");
    formData.append("instagram", config.instagram || "");
    formData.append("facebook", config.facebook || "");
    if (logoFile) formData.append("logo", logoFile);

    try {
      const res = await fetch("/api/admin/configuracion", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (data.ok) {
        mostrar({ tipo: "ok", texto: "Configuración guardada" });
        setLogoFile(null);
        // Recargar datos del servidor
        const resFresh = await fetch(
          `/api/admin/configuracion?estudioId=${ESTUDIO_ID}`,
        );
        const dataFresh = await resFresh.json();
        if (dataFresh.ok) {
          setConfig(dataFresh.data);
          setPreviewLogo(dataFresh.data.logo_url || "");
        }
      } else {
        mostrar({ tipo: "error", texto: data.mensaje || "Error al guardar" });
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error de conexión" });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div
        className={`min-h-screen ${tema.bg} flex items-center justify-center`}
      >
        <p className={`text-sm ${tema.texto2}`}>Cargando configuración…</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div
        className={`min-h-screen ${tema.bg} flex items-center justify-center`}
      >
        <p className={`text-sm ${tema.texto2}`}>
          No se pudo cargar la configuración
        </p>
      </div>
    );
  }

  // Helper para inputs de esta página
  const inputCls = `h-10 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 ${tema.input}`;
  const labelCls = `block text-xs font-medium uppercase tracking-wide ${tema.texto2} mb-1.5`;

  return (
    <div
      className={`min-h-screen ${tema.bg} ${tema.texto} transition-colors duration-300`}
    >
      <div className="mx-auto max-w-4xl px-3 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        <AdminHeader
          tema={tema}
          icono="🎨"
          titulo="Personalización de Marca"
          subtitulo="Configurá el logo, colores, contacto y redes"
          links={[
            {
              href: "/admin/reservas",
              label: "Reservas",
              icono: "📋",
              color: "emerald",
            },
            {
              href: "/admin/horarios",
              label: "Horarios",
              icono: "🕒",
              color: "blue",
            },
            {
              href: "/admin/servicios",
              label: "Servicios",
              icono: "💅",
              color: "pink",
            },
            {
              href: "/admin/combos",
              label: "Combos",
              icono: "🎁",
              color: "purple",
            },
          ]}
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Logo */}
          <section
            className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-5 shadow-sm`}
          >
            <h2
              className={`text-base font-semibold tracking-tight ${tema.texto} mb-1`}
            >
              🖼️ Logo
            </h2>
            <p className={`text-xs ${tema.texto2} mb-4`}>
              PNG, JPG o WebP · máx. 1 MB
            </p>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="flex-shrink-0">
                <div
                  className={`w-36 h-36 rounded-xl border-2 border-dashed overflow-hidden relative ${
                    tema.oscuro
                      ? "border-gray-700 bg-gray-800/50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {previewLogo ? (
                    <Image
                      src={previewLogo}
                      alt="Logo preview"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <p
                      className={`absolute inset-0 grid place-items-center text-xs ${tema.texto2}`}
                    >
                      Sin logo
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className={labelCls}>Subir logo</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoChange}
                  className={`block w-full text-sm rounded-lg border cursor-pointer
                    file:mr-3 file:px-3 file:py-2 file:border-0 file:rounded-l-lg
                    file:bg-pink-500/15 file:text-pink-500 file:text-xs file:font-medium
                    ${tema.input}`}
                />
                {logoFile && (
                  <p className={`text-xs ${tema.texto2}`}>
                    📎 {logoFile.name} · {(logoFile.size / 1024).toFixed(1)} KB
                  </p>
                )}
                {config.logo_url && !logoFile && (
                  <p className={`text-xs ${tema.texto2}`}>
                    ℹ️ Logo actual cargado. Subí uno nuevo para reemplazarlo.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Identidad: nombre + slogan */}
          <section
            className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-5 shadow-sm`}
          >
            <h2
              className={`text-base font-semibold tracking-tight ${tema.texto} mb-4`}
            >
              ✍️ Identidad
            </h2>

            <div className="grid gap-4">
              <div>
                <label className={labelCls}>Nombre de la estética</label>
                <input
                  type="text"
                  value={config.nombre || ""}
                  onChange={(e) =>
                    setConfig({ ...config, nombre: e.target.value })
                  }
                  placeholder="Ej: Belleza Posadas"
                  maxLength={50}
                  className={inputCls}
                />
                <p className={`text-xs ${tema.texto2} mt-1 text-right`}>
                  {config.nombre?.length || 0}/50
                </p>
              </div>

              <div>
                <label className={labelCls}>Slogan</label>
                <input
                  type="text"
                  value={config.slogan || ""}
                  onChange={(e) =>
                    setConfig({ ...config, slogan: e.target.value })
                  }
                  placeholder="Ej: Tu belleza, nuestra pasión"
                  maxLength={100}
                  className={inputCls}
                />
                <p className={`text-xs ${tema.texto2} mt-1 text-right`}>
                  {config.slogan?.length || 0}/100
                </p>
              </div>
            </div>
          </section>

          {/* Colores */}
          <section
            className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-5 shadow-sm`}
          >
            <h2
              className={`text-base font-semibold tracking-tight ${tema.texto} mb-4`}
            >
              🎨 Paleta de colores
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                [
                  {
                    key: "color_primario",
                    label: "Primario",
                    hint: "Botones y acentos",
                  },
                  {
                    key: "color_secundario",
                    label: "Secundario",
                    hint: "Detalles",
                  },
                  {
                    key: "color_fondo",
                    label: "Fondo",
                    hint: "Página pública",
                  },
                ] as const
              ).map(({ key, label, hint }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config[key]}
                      onChange={(e) =>
                        setConfig({ ...config, [key]: e.target.value })
                      }
                      className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-gray-300 bg-transparent p-0.5 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={config[key]}
                      onChange={(e) =>
                        setConfig({ ...config, [key]: e.target.value })
                      }
                      className={`flex-1 min-w-0 font-mono text-xs ${inputCls}`}
                    />
                  </div>
                  <p className={`text-xs ${tema.texto2} mt-1`}>{hint}</p>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div
              className="mt-5 rounded-xl border p-4"
              style={{
                backgroundColor: config.color_fondo,
                borderColor: tema.oscuro ? "#374151" : "#e5e7eb",
              }}
            >
              <p className={`text-xs font-medium ${tema.texto2} mb-2`}>
                Vista previa:
              </p>
              <div className="flex gap-2 flex-wrap">
                <div
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: config.color_primario }}
                >
                  Botón primario
                </div>
                <div
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: config.color_secundario }}
                >
                  Botón secundario
                </div>
              </div>
            </div>
          </section>

          {/* Contacto y redes */}
          <section
            className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-5 shadow-sm`}
          >
            <h2
              className={`text-base font-semibold tracking-tight ${tema.texto} mb-4`}
            >
              📞 Contacto y redes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>WhatsApp (solo números)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={config.whatsapp || ""}
                  onChange={(e) =>
                    setConfig({ ...config, whatsapp: e.target.value })
                  }
                  placeholder="3764803540"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Dirección</label>
                <input
                  type="text"
                  value={config.direccion || ""}
                  onChange={(e) =>
                    setConfig({ ...config, direccion: e.target.value })
                  }
                  placeholder="Av. Mitre 1234, Posadas"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Instagram (sin @)</label>
                <input
                  type="text"
                  value={config.instagram || ""}
                  onChange={(e) =>
                    setConfig({ ...config, instagram: e.target.value })
                  }
                  placeholder="belleza_posadas"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Facebook (usuario o URL)</label>
                <input
                  type="text"
                  value={config.facebook || ""}
                  onChange={(e) =>
                    setConfig({ ...config, facebook: e.target.value })
                  }
                  placeholder="bellezaposadas"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          {/* Guardar */}
          <div className="sticky bottom-4 z-10">
            <button
              type="submit"
              disabled={guardando}
              className={`w-full sm:w-auto sm:ml-auto sm:block text-sm ${tema.btnPrimario} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {guardando ? "Guardando…" : "💾 Guardar configuración"}
            </button>
          </div>
        </form>
      </div>

      <Toaster toast={toast} onCerrar={cerrar} />
    </div>
  );
}
