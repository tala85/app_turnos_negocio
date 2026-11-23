"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      setError("Ingresá el nombre de tu estudio");
      return;
    }
    // Normalizar: lowercase, sin espacios, guiones en vez de espacios
    const slugNormalizado = slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    
    if (!slugNormalizado) {
      setError("Slug inválido");
      return;
    }
    
    router.push(`/${slugNormalizado}/admin/login`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-rose-500 text-white text-2xl mb-4 shadow-lg shadow-rose-500/20">
            💅
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ingresar a TurnosPro</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresá el nombre de tu estudio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de tu estudio
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setError("");
              }}
              placeholder="Ej: belleza-posadas"
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
            />
            <p className="text-xs text-gray-400 mt-1">
              Es el nombre que aparece en tu link de reservas
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-rose-500 hover:brightness-110 text-white font-semibold rounded-lg transition-all shadow-md shadow-rose-500/20"
          >
            Continuar →
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            href="/plataforma"
            className="block text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Volver a la plataforma
          </Link>
          <p className="text-xs text-gray-400">
            ¿No tenés estudio?{" "}
            <Link href="/registro" className="text-rose-600 hover:underline font-medium">
              Creá uno gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}