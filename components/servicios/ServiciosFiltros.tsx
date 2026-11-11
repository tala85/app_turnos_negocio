"use client";

import type { Tema } from "@/lib/admin/tema";
import type { Filtro, Orden } from "@/features/servicios/types";

type Props = {
  tema: Tema;
  total: number;
  activos: number;
  inactivos: number;
  visibles: number;
  busqueda: string;
  setBusqueda: (v: string) => void;
  filtro: Filtro;
  setFiltro: (v: Filtro) => void;
  orden: Orden;
  setOrden: (v: Orden) => void;
  onLimpiar: () => void;
};

export default function ServiciosFiltros({
  tema, total, activos, inactivos, visibles,
  busqueda, setBusqueda, filtro, setFiltro, orden, setOrden, onLimpiar,
}: Props) {
  const tarjetas = [
    { key: "todos" as const, label: "Total", valor: total, acento: "from-pink-500 to-fuchsia-600" },
    { key: "activos" as const, label: "Activos", valor: activos, acento: "from-emerald-500 to-teal-600" },
    { key: "inactivos" as const, label: "Inactivos", valor: inactivos, acento: "from-amber-500 to-orange-600" },
  ];

  const campo = `h-11 rounded-xl border text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${tema.input}`;

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        {tarjetas.map((c) => {
          const sel = filtro === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setFiltro(c.key)}
              aria-pressed={sel}
              className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${tema.tarjeta} ${
                sel ? "border-pink-500 ring-2 ring-pink-500/30" : tema.borde
              }`}
            >
              <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.acento}`} />
              <p className={`text-[11px] uppercase tracking-wide ${tema.texto2}`}>{c.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{c.valor}</p>
            </button>
          );
        })}
      </div>

      <div className={`${tema.tarjeta} mb-3 rounded-2xl border ${tema.borde} p-3 shadow-sm sm:mb-4 sm:p-4`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              aria-label="Buscar servicios"
              className={`${campo} w-full pl-9 pr-9`}
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
                className={`absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-xs ${tema.suave} ${tema.texto2}`}
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            aria-label="Ordenar servicios"
            className={`${campo} px-3`}
          >
            <option value="nombre">Nombre (A–Z)</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="duracion">Duración: menor a mayor</option>
          </select>
        </div>

        {(busqueda !== "" || filtro !== "todos") && (
          <p className={`mt-2 text-xs ${tema.texto2}`}>
            Mostrando <strong className={tema.texto}>{visibles}</strong> de {total} servicios ·{" "}
            <button type="button" onClick={onLimpiar} className="font-semibold text-pink-500 underline underline-offset-2">
              Limpiar filtros
            </button>
          </p>
        )}
      </div>
    </>
  );
}