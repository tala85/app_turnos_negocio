"use client";

import { useState } from "react";
import type { ItemReserva, ClienteInput } from "@/lib/types";

type HorarioDisponible = { inicio: string; fin: string; slots_necesarios: number };

type Props = {
  items: ItemReserva[];
  total: number;
  sena: number;
  minutos: number;
  requiereSena: boolean;
  fecha: string;
  horario: HorarioDisponible | null;
  cliente: ClienteInput;
  onConfirmar: () => void;
  cargando: boolean;
  error: string | null;
  colores: { primario: string; secundario: string; fondo: string };
};

const formatearHora = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("es-AR", { 
      hour: "2-digit", 
      minute: "2-digit", 
      timeZone: "America/Argentina/Buenos_Aires" 
    });
  } catch {
    return "";
  }
};

export default function ResumenReserva({
  items, total, sena, minutos, requiereSena, fecha, horario, cliente,
  onConfirmar, cargando, error, colores
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const puedeConfirmar = items.length > 0 && fecha && horario && cliente.nombre && cliente.apellido && cliente.telefono;

  // Versión mobile: drawer
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <>
        {/* Botón flotante para abrir */}
        <button
          type="button"
          onClick={() => setAbierto(true)}
          disabled={!puedeConfirmar || cargando}
          className="fixed bottom-4 left-4 right-4 z-40 h-14 rounded-2xl text-white font-bold text-lg shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed md:hidden"
          style={{ backgroundColor: puedeConfirmar ? colores.primario : '#9ca3af' }}
        >
          {cargando ? "Procesando..." : requiereSena ? `Pagar seña $${sena.toLocaleString("es-AR")}` : "Confirmar Reserva"}
        </button>

        {/* Drawer */}
        {abierto && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAbierto(false)} />
            
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
              {/* Handle */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

              <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen de tu reserva</h3>

              {items.length > 0 && (
                <div className="space-y-2 mb-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.nombre}</span>
                      <span className="font-medium">${item.precio.toLocaleString("es-AR")}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span>${total.toLocaleString("es-AR")}</span>
                    </div>
                    {requiereSena && (
                      <div className="flex justify-between text-sm mt-1" style={{ color: colores.primario }}>
                        <span>Seña a pagar ahora (30%)</span>
                        <span className="font-bold">${sena.toLocaleString("es-AR")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {fecha && horario && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
                  <p><span className="font-medium">📅 Fecha:</span> {new Date(fecha).toLocaleDateString("es-AR")}</p>
                  <p><span className="font-medium">⏰ Hora:</span> {formatearHora(horario.inicio)} - {formatearHora(horario.fin)}</p>
                  <p><span className="font-medium">⏱️ Duración:</span> {minutos} min</p>
                </div>
              )}

              {cliente.nombre && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
                  <p><span className="font-medium">👤 Cliente:</span> {cliente.nombre} {cliente.apellido}</p>
                  <p><span className="font-medium"> Teléfono:</span> {cliente.telefono}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-4 border border-red-200">
                  ️ {error}
                </div>
              )}

              <button
                onClick={() => {
                  setAbierto(false);
                  onConfirmar();
                }}
                disabled={!puedeConfirmar || cargando}
                className="w-full h-14 rounded-2xl text-white font-bold text-lg shadow-lg transition-all disabled:opacity-50"
                style={{ backgroundColor: puedeConfirmar ? colores.primario : '#9ca3af' }}
              >
                {cargando ? "Procesando..." : requiereSena ? `Pagar seña $${sena.toLocaleString("es-AR")}` : "Confirmar Reserva"}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Versión desktop (la que ya tenías)
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hidden md:block">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen de tu reserva</h3>

      {items.length > 0 && (
        <div className="space-y-2 mb-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.nombre}</span>
              <span className="font-medium">${item.precio.toLocaleString("es-AR")}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Total</span>
              <span>${total.toLocaleString("es-AR")}</span>
            </div>
            {requiereSena && (
              <div className="flex justify-between text-sm mt-1" style={{ color: colores.primario }}>
                <span>Seña a pagar ahora (30%)</span>
                <span className="font-bold">${sena.toLocaleString("es-AR")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {fecha && horario && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
          <p><span className="font-medium">📅 Fecha:</span> {new Date(fecha).toLocaleDateString("es-AR")}</p>
          <p><span className="font-medium">⏰ Hora:</span> {formatearHora(horario.inicio)} - {formatearHora(horario.fin)}</p>
          <p><span className="font-medium">️ Duración:</span> {minutos} min</p>
        </div>
      )}

      {cliente.nombre && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
          <p><span className="font-medium"> Cliente:</span> {cliente.nombre} {cliente.apellido}</p>
          <p><span className="font-medium">📱 Teléfono:</span> {cliente.telefono}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={onConfirmar}
        disabled={!puedeConfirmar || cargando}
        className="w-full py-3 rounded-lg text-white font-bold text-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        style={{ backgroundColor: puedeConfirmar ? colores.primario : '#9ca3af' }}
      >
        {cargando ? "Procesando..." : requiereSena ? `Pagar seña $${sena.toLocaleString("es-AR")}` : "Confirmar Reserva"}
      </button>
      
      {!puedeConfirmar && (
        <p className="text-xs text-gray-500 text-center mt-3">
          Completá todos los pasos para habilitar la reserva
        </p>
      )}
    </div>
  );
}