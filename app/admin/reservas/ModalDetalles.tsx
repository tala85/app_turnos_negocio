"use client";

import { Servicio, Combo, Turno, Estudio, Reserva } from "./ReservasClient";

type ReservaDetalles = Reserva & {
  servicios: Servicio[];
  combos: Combo[];
  turnos: Turno[];
  estudio: Estudio | null;
};

type Props = {
  detalles: ReservaDetalles;
  onClose: () => void;
  onCambiarEstado: (id: string, estado: string) => void;
};

export default function ModalDetalles({
  detalles,
  onClose,
  onCambiarEstado,
}: Props) {
  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    });

  const colorEstado = () => {
    const colores: Record<string, string> = {
      bloqueada: "bg-amber-100 text-amber-800",
      pagada: "bg-blue-100 text-blue-800",
      confirmada: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
    };
    return colores[detalles.estado] || "bg-gray-100";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Detalles de la reserva
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">👤 Cliente</h3>
          <p className="text-gray-600">
            {detalles.cliente_nombre} {detalles.cliente_apellido}
          </p>
          <p className="text-sm text-gray-500">
            DNI: {detalles.cliente_dni} | Tel: {detalles.cliente_telefono}
          </p>
        </div>

        {detalles.estudio && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">📍 Estudio</h3>
            <p className="text-gray-600">{detalles.estudio.nombre}</p>
            <p className="text-sm text-gray-500">
              {detalles.estudio.direccion}
            </p>
          </div>
        )}

        {detalles.servicios.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">💅 Servicios</h3>
            {detalles.servicios.map((s) => (
              <div key={s.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{s.nombre}</span>
                <span className="font-medium">
                  ${s.precio.toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        )}

        {detalles.turnos.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">🕐 Horario</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <strong>Desde:</strong>{" "}
                {formatearFecha(detalles.turnos[0].inicio)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Duración:</strong> {detalles.turnos.length * 30} min
              </p>
            </div>
          </div>
        )}

        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-lg">
              ${detalles.total.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Seña (30%):</span>
            <span className="font-bold text-pink-600">
              ${detalles.sena.toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colorEstado()}`}
          >
            {detalles.estado.toUpperCase()}
          </span>
        </div>

        <div className="flex gap-2">
          {/* Botón WhatsApp - siempre visible */}
          <a
            href={`https://wa.me/54${detalles.cliente_telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
              `Hola ${detalles.cliente_nombre}! Te confirmamos tu reserva en Belleza Posadas.\n\n📅 Fecha: ${formatearFecha(detalles.turnos[0]?.inicio || "")}\n⏰ Duración: ${detalles.turnos.length * 30} minutos\n💰 Total: $${detalles.total.toLocaleString("es-AR")}\n\n¡Te esperamos!`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-center flex items-center justify-center gap-2 text-sm"
          >
            📱 Enviar WhatsApp
          </a>
        </div>

        <div className="flex gap-2 mt-2">
          {detalles.estado === "bloqueada" && (
            <>
              <button
                onClick={() => {
                  onCambiarEstado(detalles.id, "confirmada");
                  onClose();
                }}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  onCambiarEstado(detalles.id, "cancelada");
                  onClose();
                }}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                Cancelar
              </button>
            </>
          )}
          {detalles.estado === "pagada" && (
            <button
              onClick={() => {
                onCambiarEstado(detalles.id, "confirmada");
                onClose();
              }}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              Confirmar reserva
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
