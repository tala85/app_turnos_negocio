'use client';

import type { ItemReserva } from '@/lib/types';

type Props = {
  items: ItemReserva[];
  total: number;
  sena: number;
  minutos: number;
  requiereSena: boolean;
  fecha: string;
  horario: { inicio: string; fin: string } | null;  // ← objeto o null
  cliente: { nombre: string; apellido: string; dni: string; telefono: string };
  onConfirmar: () => void;
  cargando: boolean;
  error: string | null;
};

// ✅ Función para formatear hora (ISO → "09:00")
const formatearHora = (iso: string) => {
  const fecha = new Date(iso);
  return fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
};

// ✅ Formatea número como moneda argentina
const formatoMoneda = (valor: number) =>
  valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

export default function ResumenReserva({
  items,
  total,
  sena,
  minutos,
  requiereSena,
  fecha,
  horario,  // ← ahora es un objeto {inicio, fin} o null
  cliente,
  onConfirmar,
  cargando,
  error,
}: Props) {
  // ✅ Validación corregida: horario es objeto, no array
  const tieneTodo =
    items.length > 0 &&
    fecha &&
    horario !== null &&  // ← cambiado de horarios.length > 0
    cliente.nombre &&
    cliente.apellido &&
    cliente.dni &&
    cliente.telefono;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md sticky top-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Resumen</h2>

      {/* Servicios elegidos */}
      {items.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Servicios
          </h3>
          <ul className="space-y-1">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>{item.nombre}</span>
                <span className="font-medium">
                  {formatoMoneda(item.precio)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fecha y horario */}
      {fecha && horario && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Horario</h3>
          <p className="text-sm text-gray-700">
            📅 {new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          {/* ✅ Ahora usamos formatearHora con horario.inicio y horario.fin */}
          <p className="text-sm text-gray-700">
            🕐 {formatearHora(horario.inicio)} - {formatearHora(horario.fin)}
          </p>
          <p className="text-sm text-gray-700">
            ⏱️ Duración total: {minutos} minutos
          </p>
        </div>
      )}

      {/* Cliente */}
      {cliente.nombre && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Cliente</h3>
          <p className="text-sm text-gray-700">
            👤 {cliente.nombre} {cliente.apellido}
          </p>
          <p className="text-sm text-gray-700">📄 DNI: {cliente.dni}</p>
          <p className="text-sm text-gray-700">📞 {cliente.telefono}</p>
        </div>
      )}

      {/* Total */}
      {items.length > 0 && (
        <div className="border-t-2 border-gray-200 pt-4 mb-4">
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Total:</span>
            <span>{formatoMoneda(total)}</span>
          </div>
          {requiereSena && (
            <div className="flex justify-between text-sm text-pink-600 mt-1">
              <span>Seña (30%):</span>
              <span className="font-semibold">{formatoMoneda(sena)}</span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Botón confirmar */}
      <button
        type="button"
        onClick={onConfirmar}
        disabled={!tieneTodo || cargando}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-all
          ${
            tieneTodo && !cargando
              ? 'bg-pink-500 hover:bg-pink-600 shadow-md'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
      >
        {cargando
          ? '⏳ Procesando...'
          : requiereSena
            ? `Pagar seña de ${formatoMoneda(sena)}`
            : 'Confirmar reserva'}
      </button>

      {!tieneTodo && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Completá todos los pasos para confirmar
        </p>
      )}
    </div>
  );
}