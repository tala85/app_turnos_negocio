"use client";

import { useState, useRef, useEffect } from "react";

type Opcion = {
  valor: string | number;
  etiqueta: string;
};

type Props = {
  opciones: Opcion[];
  valor: string | number;
  onChange: (valor: string | number) => void;
  placeholder?: string;
  tema: {
    oscuro: boolean;
    tarjeta: string;
    borde: string;
    texto: string;
    texto2: string;
    input: string;
  };
};

export default function SelectPersonalizado({
  opciones,
  valor,
  onChange,
  placeholder = "Seleccioná una opción",
  tema,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const opcionSeleccionada = opciones.find((o) => o.valor === valor);

  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className={`h-10 w-full rounded-lg border px-3 text-left text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 ${tema.input} ${tema.texto}`}
      >
        {opcionSeleccionada ? opcionSeleccionada.etiqueta : placeholder}
      </button>

      {abierto && (
        <div className={`absolute z-50 mt-1 w-full rounded-xl border shadow-lg ${tema.tarjeta} ${tema.borde}`}>
          {opciones.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => {
                onChange(opcion.valor);
                setAbierto(false);
              }}
              className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-pink-500/10 ${
                opcion.valor === valor ? "bg-pink-500/15 font-medium" : ""
              } ${tema.texto}`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}