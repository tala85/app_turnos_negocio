'use client';

import type { Slot } from '@/lib/types';
import SlotTurno from './SlotTurno';

type Props = {
  slots: Slot[];
  seleccionados: string[];
  onToggle: (id: string) => void;
  fecha: string;
};

export default function GrillaTurnos({
  slots,
  seleccionados,
  onToggle,
  fecha,
}: Props) {
  // Formatear la fecha para mostrarla
  const fechaFormateada = new Date(fecha + 'T12:00:00').toLocaleDateString(
    'es-AR',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
  );

  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-center text-gray-500 shadow-sm">
        <p className="text-lg">😔 No hay turnos disponibles para esta fecha</p>
        <p className="text-sm mt-2">Probá con otro día</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3 capitalize">
        {fechaFormateada}
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {slots.map((slot) => (
          <SlotTurno
            key={slot.id}
            slot={slot}
            seleccionado={seleccionados.includes(slot.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}