"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  estudioId: string;
  nombre: string;
};

export default function AccionesEstudio({ estudioId, nombre }: Props) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  const impersonar = async () => {
    if (
      !confirm(
        `¿Entrar al panel de "${nombre}" como soporte?\n\n` +
          `Vas a ver SUS datos. La sesión dura 30 min. ` +
          `Para volver, cerrá sesión desde el panel del estudio.`
      )
    )
      return;

    setCargando(true);
    try {
      const res = await fetch('/api/super-admin/impersonar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudioId }),
      });

      const data = await res.json();

      if (data.ok) {
        // ✅ El panel lee el estudio de la cookie → muestra el de este estudio
        router.push('/admin/reservas');
      } else {
        alert(data.mensaje || 'Error al impersonar');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <button
      onClick={impersonar}
      disabled={cargando}
      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
    >
      {cargando ? 'Entrando...' : '👁️ Ver panel'}
    </button>
  );
}