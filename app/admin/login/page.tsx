"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.ok) {
        router.push("/admin/reservas");
      } else {
        setError(data.mensaje || "Contraseña incorrecta");
      }
    } catch {
      setError(
        "Necesitás conexión a internet para iniciar sesión. Conectate e intentá de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          🔒 Acceso Admin
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Ingresá la contraseña para acceder al panel
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Ingresá la contraseña"
              required
              disabled={cargando}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <Link
          href="/"
          className="block text-center text-gray-500 text-sm mt-4 hover:text-gray-700"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
