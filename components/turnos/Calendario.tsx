'use client';

import { useMemo, useState } from 'react';

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
  const hoy = useMemo(() => {
    const h = new Date();
    h.setHours(0, 0, 0, 0);
    return h;
  }, []);

  // Estado para el mes que se está viendo
  const [mesVista, setMesVista] = useState(() => {
    const fecha = fechaSeleccionada ? new Date(fechaSeleccionada) : hoy;
    return { año: fecha.getFullYear(), mes: fecha.getMonth() };
  });

  // Fechas límite
  const min = useMemo(() => {
    return minFecha ? new Date(minFecha) : hoy;
  }, [minFecha, hoy]);

  const max = useMemo(() => {
    const maxDefault = new Date(hoy);
    maxDefault.setDate(maxDefault.getDate() + 90); // 90 días hacia adelante
    return maxFecha ? new Date(maxFecha) : maxDefault;
  }, [maxFecha, hoy]);

  // Calcular días del mes
  const diasDelMes = useMemo(() => {
    const primerDia = new Date(mesVista.año, mesVista.mes, 1);
    const ultimoDia = new Date(mesVista.año, mesVista.mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicio = primerDia.getDay(); // 0=domingo
    
    const dias: (number | null)[] = [];
    for (let i = 0; i < diaInicio; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) dias.push(d);
    
    return dias;
  }, [mesVista]);

  // Navegación entre meses
  const mesAnterior = () => {
    setMesVista((prev) => {
      if (prev.mes === 0) return { año: prev.año - 1, mes: 11 };
      return { ...prev, mes: prev.mes - 1 };
    });
  };

  const mesSiguiente = () => {
    setMesVista((prev) => {
      if (prev.mes === 11) return { año: prev.año + 1, mes: 0 };
      return { ...prev, mes: prev.mes + 1 };
    });
  };

  const seleccionarFecha = (dia: number) => {
    const mesStr = String(mesVista.mes + 1).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');
    const fechaStr = `${mesVista.año}-${mesStr}-${diaStr}`;
    onChange(fechaStr);
  };

  const esFechaValida = (dia: number) => {
    const mesStr = String(mesVista.mes + 1).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');
    const fechaStr = `${mesVista.año}-${mesStr}-${diaStr}`;
    return fechaStr >= min.toISOString().split('T')[0] && 
           fechaStr <= max.toISOString().split('T')[0];
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Header con navegación de meses */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={mesAnterior}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Mes anterior"
        >
          ←
        </button>
        
        <h3 className="font-bold text-gray-800 capitalize">
          {meses[mesVista.mes]} {mesVista.año}
        </h3>
        
        <button
          type="button"
          onClick={mesSiguiente}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {diasSemana.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {diasDelMes.map((dia, idx) => {
          if (dia === null) {
            return <div key={`empty-${idx}`} />;
          }

          const mesStr = String(mesVista.mes + 1).padStart(2, '0');
          const diaStr = String(dia).padStart(2, '0');
          const fechaStr = `${mesVista.año}-${mesStr}-${diaStr}`;
          
          const esHoy = fechaStr === hoy.toISOString().split('T')[0];
          const estaSeleccionada = fechaStr === fechaSeleccionada;
          const sePuede = esFechaValida(dia);

          return (
            <button
              key={dia}
              type="button"
              disabled={!sePuede}
              onClick={() => seleccionarFecha(dia)}
              className={`
                aspect-square rounded-xl text-sm font-bold transition-all
                ${!sePuede 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'hover:bg-pink-100 active:scale-95'
                }
                ${esHoy && !estaSeleccionada ? 'ring-2 ring-pink-300' : ''}
                ${estaSeleccionada 
                  ? 'bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/30' 
                  : 'text-gray-700 bg-white'
                }
              `}
            >
              {dia}
            </button>
          );
        })}
      </div>
      
      {/* Info */}
      <p className="mt-3 text-xs text-center text-gray-500">
        Podés reservar hasta {max.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
      </p>
    </div>
  );
}