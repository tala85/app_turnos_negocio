"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuperAdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const res = await fetch('/api/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.ok) {
        router.push('/super-admin');
      } else {
        setError(data.mensaje || 'Contraseña incorrecta');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👑</div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Panel de control de la plataforma
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña maestra
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/plataforma" className="text-sm text-gray-500 hover:text-slate-700">
            ← Volver a la plataforma
          </Link>
        </div>
      </div>
    </div>
  );
}