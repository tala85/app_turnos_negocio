'use client';

import type { Servicio, Combo } from '@/lib/types';

type Props = {
  servicios: Servicio[];
  combos: Combo[];
  seleccionados: string[];
  onToggleServicio: (id: string) => void;
  onToggleCombo: (id: string) => void;
};

export default function ListaServicios({
  servicios,
  combos,
  seleccionados,
  onToggleServicio,
  onToggleCombo,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Servicios individuales */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Servicios individuales
        </h3>
        <div className="space-y-3">
          {servicios.map((servicio) => {
            const estaSeleccionado = seleccionados.includes(servicio.id);
            return (
              <button
                key={servicio.id}
                onClick={() => onToggleServicio(servicio.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all
                  ${
                    estaSeleccionado
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {servicio.nombre}
                    </h4>
                    {servicio.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">
                        {servicio.descripcion}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      ⏱️ {servicio.duracion_min} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-pink-600">
                      ${servicio.precio.toLocaleString('es-AR')}
                    </p>
                    {estaSeleccionado && (
                      <span className="text-xs text-pink-600 font-medium">
                        ✓ Seleccionado
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Combos */}
      {combos.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Combos y ofertas
          </h3>
          <div className="space-y-3">
            {combos.map((combo) => {
              const estaSeleccionado = seleccionados.includes(combo.id);
              return (
                <button
                  key={combo.id}
                  onClick={() => onToggleCombo(combo.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all
                    ${
                      estaSeleccionado
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        🎁 {combo.nombre}
                      </h4>
                      {combo.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">
                          {combo.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">
                        ${combo.precio_oferta.toLocaleString('es-AR')}
                      </p>
                      {estaSeleccionado && (
                        <span className="text-xs text-purple-600 font-medium">
                          ✓ Seleccionado
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}