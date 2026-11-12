"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useModoOscuro } from "@/hooks/useModoOscuro";

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

export default function AdminConfiguracionPage() {
  const { modoOscuro, setModoOscuro } = useModoOscuro();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";

  // 🎨 Clases dinámicas según el modo
  const bgPrincipal = modoOscuro ? "bg-gray-900" : "bg-gray-100";
  const bgTarjeta = modoOscuro ? "bg-gray-800" : "bg-white";
  const textoPrincipal = modoOscuro ? "text-gray-100" : "text-gray-800";
  const textoSecundario = modoOscuro ? "text-gray-400" : "text-gray-600";
  const bordeTarjeta = modoOscuro ? "border-gray-700" : "border-gray-200";
  const bgInput = modoOscuro
    ? "bg-gray-700 border-gray-600 text-gray-100"
    : "bg-white border-gray-300 text-gray-800";

  useEffect(() => {
    let isMounted = true;

    const cargarDatosInicial = async () => {
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
        if (isMounted) {
          setCargando(false);
        }
      }
    };

    cargarDatosInicial();

    return () => {
      isMounted = false;
    };
  }, []);

  const actualizarDatos = async () => {
    setCargando(true);
    try {
      const res = await fetch(
        `/api/admin/configuracion?estudioId=${ESTUDIO_ID}`,
      );
      const data = await res.json();
      if (data.ok) {
        setConfig(data.data);
        setPreviewLogo(data.data.logo_url || "");
      }
    } catch {
      console.error("Error actualizando configuración");
    } finally {
      setCargando(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) {
        alert("El logo no puede pesar más de 1 MB");
        return;
      }
      setLogoFile(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
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

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
      const res = await fetch("/api/admin/configuracion", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (data.ok) {
        alert("Configuración guardada con éxito");
        setLogoFile(null);
        actualizarDatos();
      } else {
        alert("Error: " + data.mensaje);
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div
        className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}
      >
        <p className={textoSecundario}>Cargando configuración...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div
        className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}
      >
        <p className={textoSecundario}>No se pudo cargar la configuración</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div
          className={`${bgTarjeta} rounded-xl shadow-sm p-4 mb-8 border ${bordeTarjeta}`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1
                className={`text-2xl md:text-3xl font-bold ${textoPrincipal} flex items-center gap-2`}
              >
                <span className="text-pink-500">🎨</span> Personalización de
                Marca
              </h1>
              <p className={`${textoSecundario} text-sm mt-1`}>
                Configurá el logo, slogan y colores de tu estética
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* 🌙 SWITCH MODO OSCURO */}
              <button
                onClick={() => setModoOscuro(!modoOscuro)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  modoOscuro
                    ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
                title={
                  modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
                }
              >
                <span className="text-lg">{modoOscuro ? "☀️" : "🌙"}</span>
                <span className="text-sm font-medium">
                  {modoOscuro ? "Claro" : "Oscuro"}
                </span>
              </button>

              <Link
                href="/admin/reservas"
                className="bg-white border-2 border-green-500 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
              >
                📋 Gestión de Reservas
              </Link>
              <Link
                href="/admin/servicios"
                className="bg-white border-2 border-blue-500 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                💅 Gestión de Servicios
              </Link>
              <Link
                href="/"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
              >
                ← Inicio
              </Link>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo */}
          <div
            className={`${bgTarjeta} rounded-xl shadow-md p-6 border ${bordeTarjeta}`}
          >
            <h2 className={`text-xl font-semibold ${textoPrincipal} mb-4`}>
              🖼️ Logo de la estética
            </h2>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div
                  className={`w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden relative ${modoOscuro ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-50"}`}
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
                    <p className={`${textoSecundario} text-sm text-center p-4`}>
                      Sin logo
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <label
                  className={`block text-sm font-medium ${textoSecundario} mb-2`}
                >
                  Subir logo (PNG, JPG o WebP - máx. 1 MB)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
                />
                {logoFile && (
                  <p className={`text-sm ${textoSecundario} mt-2`}>
                    📎 Archivo seleccionado: {logoFile.name} (
                    {(logoFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                {config.logo_url && !logoFile && (
                  <p className={`text-sm ${textoSecundario} mt-2`}>
                    ℹ️ Logo actual cargado. Subí uno nuevo para reemplazarlo.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div
            className={`${bgTarjeta} rounded-xl shadow-md p-6 border ${bordeTarjeta}`}
          >
            <h2 className={`text-xl font-semibold ${textoPrincipal} mb-4`}>
              🏷️ Nombre de la estética
            </h2>
            <label
              className={`block text-sm font-medium ${textoSecundario} mb-1`}
            >
              Nombre que aparece en la página principal
            </label>
            <input
              type="text"
              value={config.nombre || ""}
              onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
              placeholder="Ej: Belleza Posadas"
              maxLength={50}
            />
            <p className={`text-xs ${textoSecundario} mt-1`}>
              {config.nombre?.length || 0}/50 caracteres
            </p>
          </div>

          {/* Slogan */}
          <div
            className={`${bgTarjeta} rounded-xl shadow-md p-6 border ${bordeTarjeta}`}
          >
            <h2 className={`text-xl font-semibold ${textoPrincipal} mb-4`}>
              ✍️ Slogan / Descripción
            </h2>
            <label
              className={`block text-sm font-medium ${textoSecundario} mb-1`}
            >
              Frase que aparece en la página principal
            </label>
            <input
              type="text"
              value={config.slogan || ""}
              onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
              placeholder="Ej: Tu belleza, nuestra pasión"
              maxLength={100}
            />
            <p className={`text-xs ${textoSecundario} mt-1`}>
              {config.slogan?.length || 0}/100 caracteres
            </p>
          </div>

          {/* Colores */}
          <div
            className={`${bgTarjeta} rounded-xl shadow-md p-6 border ${bordeTarjeta}`}
          >
            <h2 className={`text-xl font-semibold ${textoPrincipal} mb-4`}>
              🎨 Paleta de colores
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${textoSecundario} mb-1`}
                >
                  Color primario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.color_primario}
                    onChange={(e) =>
                      setConfig({ ...config, color_primario: e.target.value })
                    }
                    className={`w-12 h-10 border rounded cursor-pointer ${modoOscuro ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`}
                  />
                  <input
                    type="text"
                    value={config.color_primario}
                    onChange={(e) =>
                      setConfig({ ...config, color_primario: e.target.value })
                    }
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 font-mono text-sm ${bgInput}`}
                  />
                </div>
                <p className={`text-xs ${textoSecundario} mt-1`}>
                  Botones principales y acentos
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${textoSecundario} mb-1`}
                >
                  Color secundario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.color_secundario}
                    onChange={(e) =>
                      setConfig({ ...config, color_secundario: e.target.value })
                    }
                    className={`w-12 h-10 border rounded cursor-pointer ${modoOscuro ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`}
                  />
                  <input
                    type="text"
                    value={config.color_secundario}
                    onChange={(e) =>
                      setConfig({ ...config, color_secundario: e.target.value })
                    }
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 font-mono text-sm ${bgInput}`}
                  />
                </div>
                <p className={`text-xs ${textoSecundario} mt-1`}>
                  Detalles y elementos secundarios
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${textoSecundario} mb-1`}
                >
                  Color de fondo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.color_fondo}
                    onChange={(e) =>
                      setConfig({ ...config, color_fondo: e.target.value })
                    }
                    className={`w-12 h-10 border rounded cursor-pointer ${modoOscuro ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`}
                  />
                  <input
                    type="text"
                    value={config.color_fondo}
                    onChange={(e) =>
                      setConfig({ ...config, color_fondo: e.target.value })
                    }
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 font-mono text-sm ${bgInput}`}
                  />
                </div>
                <p className={`text-xs ${textoSecundario} mt-1`}>
                  Fondo de la página
                </p>
              </div>
            </div>

            {/* Preview de colores */}
            <div
              className={`mt-6 p-4 rounded-lg border ${bordeTarjeta}`}
              style={{ backgroundColor: config.color_fondo }}
            >
              <p className={`text-sm font-medium ${textoPrincipal} mb-2`}>
                Vista previa:
              </p>
              <div className="flex gap-2">
                <div
                  className="px-4 py-2 rounded text-white font-medium text-sm"
                  style={{ backgroundColor: config.color_primario }}
                >
                  Botón primario
                </div>
                <div
                  className="px-4 py-2 rounded text-white font-medium text-sm"
                  style={{ backgroundColor: config.color_secundario }}
                >
                  Botón secundario
                </div>
              </div>
            </div>
          </div>

          {/* Datos de Contacto y Redes */}
          <div
            className={`${bgTarjeta} rounded-xl shadow-md p-6 border ${bordeTarjeta}`}
          >
            <h2 className={`text-xl font-semibold ${textoPrincipal} mb-4`}>
              📞 Datos de Contacto y Redes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${textoSecundario} mb-1`}
                >
                  WhatsApp (solo números)
                </label>
                <input
                  type="text"
                  value={config.whatsapp || ""}
                  onChange={(e) =>
                    setConfig({ ...config, whatsapp: e.target.value })
                  }
                  placeholder="3764803540"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${textoSecundario} mb-1`}
                >
                  Dirección del estudio
                </label>
                <input
                  type="text"
                  value={config.direccion || ""}
                  onChange={(e) =>
                    setConfig({ ...config, direccion: e.target.value })
                  }
                  placeholder="Av. Mitre 1234, Posadas"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${textoSecundario} mb-1`}
                >
                  Instagram (sin @)
                </label>
                <input
                  type="text"
                  value={config.instagram || ""}
                  onChange={(e) =>
                    setConfig({ ...config, instagram: e.target.value })
                  }
                  placeholder="belleza_posadas"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${textoSecundario} mb-1`}
                >
                  Facebook (usuario o URL)
                </label>
                <input
                  type="text"
                  value={config.facebook || ""}
                  onChange={(e) =>
                    setConfig({ ...config, facebook: e.target.value })
                  }
                  placeholder="bellezaposadas"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
                />
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 font-semibold transition-colors disabled:opacity-50"
            >
              {guardando ? "💾 Guardando..." : "💾 Guardar configuración"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
