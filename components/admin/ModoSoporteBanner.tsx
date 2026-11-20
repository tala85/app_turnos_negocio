"use client";

import { useRouter } from 'next/navigation';

export default function ModoSoporteBanner({ nombre }: { nombre: string }) {
  const router = useRouter();

  const salir = async () => {
    await fetch('/api/super-admin/salir-soporte', { method: 'POST' });
    router.push('/super-admin');
  };

  return (
    <div className="sticky top-0 z-50 bg-amber-400 text-black px-4 py-2.5 flex items-center justify-between gap-4 shadow-lg">
      <p className="text-sm font-semibold flex items-center gap-2">
        <span className="text-lg">👁️</span>
        <span>
          <strong>Modo soporte:</strong> estás viendo el panel de{' '}
          <em>&ldquo;{nombre}&rdquo;</em>
        </span>
      </p>
      <button
        onClick={salir}
        className="shrink-0 bg-black text-amber-400 hover:bg-slate-800 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
      >
        ← Salir del modo soporte
      </button>
    </div>
  );
}