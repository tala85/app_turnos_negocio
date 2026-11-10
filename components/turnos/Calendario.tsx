'use client';

import { useState } from 'react';

type Props = {
  fechaSeleccionada: string; // formato YYYY-MM-DD
  onChange: (fecha: string) => void;
  minFecha?: string; // fecha mínima (por defecto hoy)
  maxFecha?: string; // fecha máxima (por defecto +30 días)
};

export default function Calendario({
  fechaSeleccionada,
  onChange,
  minFecha,
  maxFecha,
}: Props) {
  // Estado para el mes que se está viendo (no el seleccionado)
  const [mesVista, setMesVista] = useState(() => {
    const hoy = new Date();
    return { año: hoy.getFullYear(), mes: hoy.getMonth() };
  });

  // Nombres de meses y días en español
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  // Calcular días del mes
  const primerDia = new Date(mesVista.año, mesVista.mes, 1);
  const ultimoDia = new Date(mesVista.año, mesVista.mes + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const diaInicio = primerDia.getDay(); // 0=domingo

  // Fecha mínima por defecto: hoy
  const hoy = new Date().toISOString().split('T')[0];
  const min = minFecha || hoy;

  // Fecha máxima por defecto: 30 días desde hoy
  const maxDefault = new Date();
  maxDefault.setDate(maxDefault.getDate() + 30);
  const max = maxFecha || maxDefault.toISOString().split('T')[0];

  // Navegar al mes anterior
  const mesAnterior = () => {
    setMesVista((prev) => {
      if (prev.mes === 0) return { año: prev.año - 1, mes: 11 };
      return { ...prev, mes: prev.mes - 1 };
    });
  };

  // Navegar al mes siguiente
  const mesSiguiente = () => {
    setMesVista((prev) => {
      if (prev.mes === 11) return { año: prev.año + 1, mes: 0 };
      return { ...prev, mes: prev.mes + 1 };
    });
  };

  // ¿Se puede seleccionar esta fecha?
  const esSeleccionable = (fecha: string) => {
    return fecha >= min && fecha <= max;
  };

  // Generar los días del calendario (incluyendo espacios vacíos al inicio)
  const dias: (number | null)[] = [];
  for (let i = 0; i < diaInicio; i++) dias.push(null);
  for (let d = 1; d <= diasEnMes; d++) dias.push(d);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={mesAnterior}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Mes anterior"
        >
          ←
        </button>
        <h3 className="font-semibold text-gray-800">
          {meses[mesVista.mes]} {mesVista.año}
        </h3>
        <button
          type="button"
          onClick={mesSiguiente}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
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
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {dias.map((dia, idx) => {
          if (dia === null) {
            return <div key={`empty-${idx}`} />;
          }

          // Construir fecha en formato YYYY-MM-DD
          const mesStr = String(mesVista.mes + 1).padStart(2, '0');
          const diaStr = String(dia).padStart(2, '0');
          const fechaStr = `${mesVista.año}-${mesStr}-${diaStr}`;

          const esHoy = fechaStr === hoy;
          const estaSeleccionada = fechaStr === fechaSeleccionada;
          const sePuede = esSeleccionable(fechaStr);

          return (
            <button
              key={dia}
              type="button"
              disabled={!sePuede}
              onClick={() => onChange(fechaStr)}
              className={`aspect-square rounded-lg text-sm font-medium transition-all
                ${!sePuede ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-pink-100'}
                ${esHoy ? 'ring-2 ring-pink-300' : ''}
                ${estaSeleccionada ? 'bg-pink-500 text-white hover:bg-pink-600' : 'text-gray-700'}
              `}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}