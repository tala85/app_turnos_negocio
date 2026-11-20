"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const res = await fetch("/api/public/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          slug,
          password,
          // Colores por defecto profesionales (pueden personalizarse después en el panel)
          color_primario: "#ec4899",
          color_secundario: "#8b5cf6",
          color_fondo: "#fafafa",
        }),
      });

      const data = await res.json();

      if (data.ok) {
        // ✅ Éxito: redirigir al login de SU propio estudio
        router.push(`/${data.slug}/admin/login`);
      } else {
        setError(data.mensaje || "Error al crear el estudio");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-violet-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💅</div>
          <h1 className="text-2xl font-bold text-gray-900">Creá tu estudio</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configurá tu espacio en menos de 1 minuto
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre del estudio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de tu estética *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Belleza Posadas"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Slug (URL) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario (para tu link) *
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                tuapp.com/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                placeholder="belleza-posadas"
                required
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Solo letras minúsculas, números y guiones. Este será tu link
              público.
            </p>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña de administrador *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creando tu estudio...
              </>
            ) : (
              "🚀 Crear mi estudio"
            )}
          </button>
        </form>

        {/* Pie de página */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-pink-600 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
