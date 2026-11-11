'use client';

import { useState } from 'react';
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
  const [filtro, setFiltro] = useState<'todos' | 'servicios' | 'combos'>('todos');

  const todosItems = [
    ...servicios.map((s) => ({ ...s, tipo: 'servicio' as const })),
    ...combos.map((c) => ({ ...c, tipo: 'combo' as const })),
  ];

  const itemsFiltrados =
    filtro === 'todos'
      ? todosItems
      : filtro === 'servicios'
        ? servicios.map((s) => ({ ...s, tipo: 'servicio' as const }))
        : combos.map((c) => ({ ...c, tipo: 'combo' as const }));

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          type="button"
          onClick={() => setFiltro('todos')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            filtro === 'todos'
              ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos ({todosItems.length})
        </button>
        <button
          type="button"
          onClick={() => setFiltro('servicios')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            filtro === 'servicios'
              ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Servicios ({servicios.length})
        </button>
        {combos.length > 0 && (
          <button
            type="button"
            onClick={() => setFiltro('combos')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filtro === 'combos'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎁 Combos ({combos.length})
          </button>
        )}
      </div>

      {/* Grid de items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {itemsFiltrados.map((item) => {
          const esCombo = item.tipo === 'combo';
          const estaSeleccionado = seleccionados.includes(item.id);
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => (esCombo ? onToggleCombo(item.id) : onToggleServicio(item.id))}
              className={`
                relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200
                active:scale-[0.98]
                ${estaSeleccionado
                  ? esCombo
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20'
                    : 'border-pink-500 bg-gradient-to-br from-pink-50 to-fuchsia-50 shadow-lg shadow-pink-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              {/* Badge de selección */}
              {estaSeleccionado && (
                <div className={`
                  absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center
                  ${esCombo ? 'bg-purple-500' : 'bg-pink-500'}
                `}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icono */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3
                ${estaSeleccionado
                  ? esCombo
                    ? 'bg-purple-500/20'
                    : 'bg-pink-500/20'
                  : 'bg-gray-100'
                }
              `}>
                {esCombo ? '🎁' : ''}
              </div>

              {/* Contenido */}
              <div className="pr-12">
                <h4 className={`font-bold text-base ${estaSeleccionado ? 'text-gray-900' : 'text-gray-800'}`}>
                  {item.nombre}
                </h4>
                
                {item.descripcion && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.descripcion}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  {'duracion_min' in item && (
                    <span className="flex items-center gap-1">
                      ⏱️ {item.duracion_min} min
                    </span>
                  )}
                </div>

                {/* Precio */}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-lg font-bold ${estaSeleccionado ? (esCombo ? 'text-purple-600' : 'text-pink-600') : 'text-gray-900'}`}>
                    ${'precio_oferta' in item ? item.precio_oferta.toLocaleString('es-AR') : item.precio.toLocaleString('es-AR')}
                  </span>
                  
                  {estaSeleccionado && (
                    <span className={`text-xs font-semibold ${esCombo ? 'text-purple-600' : 'text-pink-600'}`}>
                      Seleccionado
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Contador */}
      <p className="text-center text-sm text-gray-500">
        {seleccionados.length} servicio{seleccionados.length !== 1 ? 's' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}