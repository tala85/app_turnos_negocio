'use client';

import { useMemo } from 'react';

type Props = {
  fechaSeleccionada: string;
  onChange: (fecha: string) => void;
  minFecha?: string;
  maxFecha?: string;
  label?: string;
};

export default function Calendario({
  fechaSeleccionada,
  onChange,
  minFecha,
  maxFecha,
  label = 'Seleccioná una fecha',
}: Props) {
  // Generar días disponibles (próximos 14 días)
  const diasDisponibles = useMemo(() => {
    const dias: { fechaStr: string; diaSemana: string; diaNum: number; mes: string }[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Calcular min y max DENTRO del useMemo para evitar warnings de dependencias
    const min = minFecha ? new Date(minFecha) : hoy;
    const maxDefault = new Date(hoy);
    maxDefault.setDate(maxDefault.getDate() + 60);
    const max = maxFecha ? new Date(maxFecha) : maxDefault;

    // Próximos 14 días
    for (let i = 0; i < 14; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);
      
      if (fecha >= min && fecha <= max) {
        const fechaStr = fecha.toISOString().split('T')[0];
        const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'short' });
        const diaNum = fecha.getDate();
        const mes = fecha.toLocaleDateString('es-AR', { month: 'short' });
        
        dias.push({
          fechaStr,
          diaSemana: diaSemana.replace('.', ''),
          diaNum,
          mes: mes.replace('.', ''),
        });
      }
    }
    
    return dias;
  }, [minFecha, maxFecha]);

  const seleccionarFecha = (fechaStr: string) => {
    onChange(fechaStr);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Scroll horizontal de días */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {diasDisponibles.map(({ fechaStr, diaSemana, diaNum, mes }) => {
            const estaSeleccionada = fechaStr === fechaSeleccionada;
            const esHoy = fechaStr === new Date().toISOString().split('T')[0];
            
            return (
              <button
                key={fechaStr}
                type="button"
                onClick={() => seleccionarFecha(fechaStr)}
                className={`
                  snap-start shrink-0 w-20 h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1
                  transition-all duration-200 active:scale-95
                  ${estaSeleccionada
                    ? 'bg-gradient-to-br from-pink-500 to-fuchsia-600 border-pink-500 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50'
                  }
                `}
              >
                <span className="text-xs font-medium uppercase">
                  {diaSemana}
                </span>
                <span className="text-2xl font-bold tabular-nums">
                  {diaNum}
                </span>
                <span className="text-xs capitalize">
                  {mes}
                </span>
                {esHoy && !estaSeleccionada && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Gradientes laterales para indicar scroll */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-gray-900" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-900" />
      </div>
      
      {/* Info */}
      <p className="mt-2 text-xs text-gray-500">
        {diasDisponibles.length} días disponibles · Deslizá para ver más
      </p>
    </div>
  );
}