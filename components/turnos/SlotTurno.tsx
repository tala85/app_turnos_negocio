'use client';

import type { Slot } from '@/lib/types';

type Props = {
  slot: Slot;
  seleccionado: boolean;
  onToggle: (id: string) => void;
};

// Formatea una fecha ISO a hora (ej: "2026-11-10T09:00:00Z" → "09:00")
const formatearHora = (iso: string) => {
  const fecha = new Date(iso);
  return fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
};

export default function SlotTurno({ slot, seleccionado, onToggle }: Props) {
  const hora = formatearHora(slot.inicio);

  // ¿Está ocupado (confirmado/pagado)?
  const ocupado = ['confirmado', 'pagado', 'completado'].includes(slot.estado);

  // ¿Está bloqueado por otro cliente?
  const enConfirmacion =
    slot.estado === 'bloqueado' && (slot.libera_en_segundos ?? 0) > 0;

  // ¿Está libre para elegir?
  const libre = slot.estado === 'libre' || enConfirmacion === false && slot.estado !== 'bloqueado';

  if (ocupado) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-3 text-center opacity-60">
        <span className="block text-sm font-medium text-gray-400 line-through">
          {hora}
        </span>
        <span className="text-[11px] text-gray-400">Reservado</span>
      </div>
    );
  }

  if (enConfirmacion) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-center">
        <span className="block text-sm font-semibold text-amber-700">
          {hora}
        </span>
        <span className="block text-[11px] leading-tight text-amber-700">
          Alguien está confirmando
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={!libre}
      onClick={() => onToggle(slot.id)}
      className={`rounded-lg border-2 px-3 py-3 text-sm font-semibold transition-all
        focus:outline-none focus:ring-2 focus:ring-pink-300
        ${
          seleccionado
            ? 'border-pink-500 bg-pink-500 text-white shadow-md'
            : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
        }
        ${!libre ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {hora}
    </button>
  );
}