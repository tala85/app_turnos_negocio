"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Props = {
  estudio: {
    slug: string;
    nombre: string;
    logo_url: string | null;
    color_primario: string;
  };
};

export default function LoginCliente({ estudio }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/${estudio.slug}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        // Por ahora el panel sigue en /admin; en el paso 2.4 será /{slug}/admin
        router.push("/admin/reservas");
      } else {
        setError(data.mensaje || "Contraseña incorrecta");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        {estudio.logo_url ? (
          <Image
            src={estudio.logo_url}
            alt={`Logo ${estudio.nombre}`}
            width={96}
            height={96}
            className="object-contain h-20 w-20 mx-auto mb-4"
            unoptimized
            priority
          />
        ) : (
          <div className="text-4xl mb-4">💅</div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {estudio.nombre}
        </h1>
        <p className="text-sm text-gray-500 mb-6">Acceso exclusivo del staff</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: estudio.color_primario }}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <Link
          href="/"
          className="block mt-4 text-sm text-gray-400 hover:text-gray-600"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
