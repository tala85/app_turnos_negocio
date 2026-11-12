"use client";

import { useMemo, useState } from "react";

type Props = {
  fechaSeleccionada: string;
  onChange: (fecha: string) => void;
  minFecha?: string;
  maxFecha?: string;
  label?: string;
  horariosDisponibles?: {
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
  }[];
  excepciones?: {
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
  }[];
};

export default function Calendario({
  fechaSeleccionada,
  onChange,
  minFecha,
  maxFecha,
  label = "Seleccioná una fecha",
  horariosDisponibles = [],
  excepciones = [],
}: Props) {
  const hoy = useMemo(() => {
    const h = new Date();
    h.setHours(0, 0, 0, 0);
    return h;
  }, []);

  const [mesVista, setMesVista] = useState(() => {
    const fecha = fechaSeleccionada ? new Date(fechaSeleccionada) : hoy;
    return { año: fecha.getFullYear(), mes: fecha.getMonth() };
  });

  const min = useMemo(() => {
    return minFecha ? new Date(minFecha) : hoy;
  }, [minFecha, hoy]);

  const max = useMemo(() => {
    const maxDefault = new Date(hoy);
    maxDefault.setDate(maxDefault.getDate() + 90);
    return maxFecha ? new Date(maxFecha) : maxDefault;
  }, [maxFecha, hoy]);

  // ✅ Verificar si un día tiene horarios disponibles
  const diaTieneHorario = (fecha: Date): boolean => {
    const fechaStr = fecha.toISOString().split("T")[0];

    // Primero verificar si hay una excepción para esta fecha
    const tieneExcepcion = excepciones.some((e) => e.fecha === fechaStr);
    if (tieneExcepcion) return true;

    // Si no hay excepción, verificar si el día de la semana tiene horario
    const diaSemana = fecha.getDay();
    return horariosDisponibles.some((h) => h.dia_semana === diaSemana);
  };

  const diasDelMes = useMemo(() => {
    const primerDia = new Date(mesVista.año, mesVista.mes, 1);
    const ultimoDia = new Date(mesVista.año, mesVista.mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicio = primerDia.getDay();

    const dias: (number | null)[] = [];
    for (let i = 0; i < diaInicio; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) dias.push(d);

    return dias;
  }, [mesVista]);

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
    const mesStr = String(mesVista.mes + 1).padStart(2, "0");
    const diaStr = String(dia).padStart(2, "0");
    const fechaStr = `${mesVista.año}-${mesStr}-${diaStr}`;
    onChange(fechaStr);
  };

  const esFechaValida = (dia: number) => {
    const fecha = new Date(mesVista.año, mesVista.mes, dia);
    // ✅ Eliminada la variable fechaStr que no se usaba
    return fecha >= min && fecha <= max && diaTieneHorario(fecha);
  };

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const diasSemana = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

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

      <div className="grid grid-cols-7 gap-1">
        {diasDelMes.map((dia, idx) => {
          if (dia === null) {
            return <div key={`empty-${idx}`} />;
          }

          const mesStr = String(mesVista.mes + 1).padStart(2, "0");
          const diaStr = String(dia).padStart(2, "0");
          const fechaStr = `${mesVista.año}-${mesStr}-${diaStr}`;

          const esHoy = fechaStr === hoy.toISOString().split("T")[0];
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
                ${
                  !sePuede
                    ? "text-gray-300 cursor-not-allowed opacity-50"
                    : "hover:bg-pink-100 active:scale-95"
                }
                ${esHoy && !estaSeleccionada ? "ring-2 ring-pink-300" : ""}
                ${
                  estaSeleccionada
                    ? "bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/30"
                    : "text-gray-700 bg-white"
                }
              `}
            >
              {dia}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-center text-gray-500">
        Solo se muestran los días con horarios disponibles
      </p>
    </div>
  );
}
