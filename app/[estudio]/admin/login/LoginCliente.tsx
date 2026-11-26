"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function LoginForm({ estudio }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // ✅ Recuperación por Magic Link
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const errorLink = searchParams.get("error") === "link_invalido";

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
      if (data.ok) router.push("/admin/reservas");
      else setError(data.mensaje || "Contraseña incorrecta");
    } catch {
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ Mandamos slug + email (doble candado en el backend)
        body: JSON.stringify({ email, slug: estudio.slug }),
      });
      const data = await res.json();
      if (data.ok) setEnviado(true);
      else setError(data.mensaje || "No se pudo enviar el enlace.");
    } catch {
      setError("Error de conexión");
    } finally {
      setEnviando(false);
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

        {errorLink && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            ⚠️ El enlace venció o es inválido. Pedí uno nuevo.
          </p>
        )}

        {/* Modo contraseña */}
        {!modoRecuperar && (
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

            <button
              type="button"
              onClick={() => {
                setModoRecuperar(true);
                setError(null);
                setEnviado(false);
              }}
              className="w-full text-center text-sm font-medium hover:opacity-80"
              style={{ color: estudio.color_primario }}
            >
              ¿Olvidaste tu clave? Enviame un enlace de acceso
            </button>
          </form>
        )}

        {/* Modo recuperación */}
        {modoRecuperar && !enviado && (
          <form onSubmit={handleRecuperar} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email del estudio
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="tu-estudio@email.com"
                required
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
              disabled={enviando}
              className="w-full py-2.5 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: estudio.color_primario }}
            >
              {enviando ? "Enviando enlace..." : "📧 Enviar enlace de acceso"}
            </button>

            <button
              type="button"
              onClick={() => {
                setModoRecuperar(false);
                setError(null);
              }}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              ← Volver a ingresar con contraseña
            </button>
          </form>
        )}

        {/* Confirmación de enviado */}
        {modoRecuperar && enviado && (
          <div className="text-center space-y-4">
            <div className="text-5xl">📬</div>
            <p className="text-gray-700">
              Si existe una cuenta con <strong>{email}</strong>, te enviamos un
              enlace.{" "}
              <span className="text-gray-500">Revisá tu casilla (y spam).</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setModoRecuperar(false);
                setEnviado(false);
                setEmail("");
              }}
              className="text-sm font-medium hover:opacity-80"
              style={{ color: estudio.color_primario }}
            >
              ← Volver al login
            </button>
          </div>
        )}

        {/* ✅ Volver a la VITRINA del estudio, no a la landing */}
        <Link
          href={`/${estudio.slug}`}
          className="block mt-6 text-sm text-gray-400 hover:text-gray-600"
        >
          ← Volver a la vitrina
        </Link>
      </div>
    </div>
  );
}

// ✅ useSearchParams exige Suspense en Next 14/15
export default function LoginCliente({ estudio }: Props) {
  return (
    <Suspense fallback={null}>
      <LoginForm estudio={estudio} />
    </Suspense>
  );
}
