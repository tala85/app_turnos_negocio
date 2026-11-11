"use client";

import type { Tema } from "@/lib/admin/tema";
import type { Servicio } from "@/features/servicios/types";
import { duracionTexto, money } from "@/features/servicios/utils";

type Props = {
  tema: Tema;
  servicio: Servicio;
  ocupado: boolean;
  onEditar: () => void;
  onToggle: () => void;
  onEliminar: () => void;
};

export default function ServicioCard({ tema, servicio: s, ocupado, onEditar, onToggle, onEliminar }: Props) {
  const base = "flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl transition-colors";

  return (
    <article
      className={`adm-in overflow-hidden rounded-2xl border ${tema.borde} ${tema.tarjeta} shadow-sm transition-opacity ${ocupado ? "opacity-60" : ""}`}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${s.activo ? "from-emerald-400 to-teal-500" : "from-gray-400 to-gray-500"}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-tight">{s.nombre}</h3>
            {s.descripcion && (
              <p className={`mt-1 line-clamp-2 text-xs leading-snug ${tema.texto2}`}>{s.descripcion}</p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tema.badge(s.activo)}`}>
            {s.activo ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${tema.suave} ${tema.texto2}`}>
            ⏱ {duracionTexto(s.duracion_min)}
          </span>
          <span className="rounded-lg bg-gradient-to-r from-pink-500/15 to-fuchsia-600/15 px-2.5 py-1.5 text-sm font-bold tabular-nums text-pink-500">
            {money(s.precio)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" onClick={onEditar} className={`${base} bg-blue-500/15 text-blue-500 active:bg-blue-500/30`}>
            <span className="text-base leading-none">✏️</span>
            <span className="text-[11px] font-bold">Editar</span>
          </button>

          <button
            type="button"
            disabled={ocupado}
            onClick={onToggle}
            className={`${base} disabled:opacity-50 ${
              s.activo
                ? "bg-amber-500/15 text-amber-600 active:bg-amber-500/30"
                : "bg-emerald-500/15 text-emerald-600 active:bg-emerald-500/30"
            }`}
          >
            <span className="text-base leading-none">{s.activo ? "⏸️" : "▶️"}</span>
            <span className="text-[11px] font-bold">{s.activo ? "Desactivar" : "Activar"}</span>
          </button>

          <button type="button" onClick={onEliminar} className={`${base} bg-red-500/15 text-red-500 active:bg-red-500/30`}>
            <span className="text-base leading-none">🗑️</span>
            <span className="text-[11px] font-bold">Eliminar</span>
          </button>
        </div>
      </div>
    </article>
  );
}