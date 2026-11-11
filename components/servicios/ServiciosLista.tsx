"use client";

import type { Tema } from "@/lib/admin/tema";
import type { Servicio } from "@/features/servicios/types";
import { duracionTexto, money } from "@/features/servicios/utils";
import ServicioCard from "./ServicioCard";

type Props = {
  tema: Tema;
  cargando: boolean;
  error: string | null;
  total: number;
  visibles: Servicio[];
  busyId: string | null;
  onReintentar: () => void;
  onNuevo: () => void;
  onLimpiarFiltros: () => void;
  onEditar: (s: Servicio) => void;
  onToggle: (s: Servicio) => void;
  onEliminar: (s: Servicio) => void;
};

export default function ServiciosLista({
  tema, cargando, error, total, visibles, busyId,
  onReintentar, onNuevo, onLimpiarFiltros, onEditar, onToggle, onEliminar,
}: Props) {
  const caja = `${tema.tarjeta} rounded-2xl border ${tema.borde} shadow-sm`;
  const th = `px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${tema.texto2}`;

  if (cargando) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${tema.tarjeta} h-32 animate-pulse rounded-2xl border ${tema.borde}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${caja} p-8 text-center`}>
        <p className="text-3xl">⚠️</p>
        <p className="mt-2 font-semibold">{error}</p>
        <button type="button" onClick={onReintentar} className={`mt-4 h-11 rounded-xl px-6 text-sm font-bold ${tema.btnPrimario}`}>
          Reintentar
        </button>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className={`${caja} p-10 text-center`}>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-pink-500/15 to-fuchsia-600/15 text-3xl">💅</div>
        <p className="mt-4 text-lg font-bold">Todavía no cargaste servicios</p>
        <p className={`mt-1 text-sm ${tema.texto2}`}>Creá el primero y va a aparecer en la página de reservas.</p>
        <button type="button" onClick={onNuevo} className={`mt-5 h-12 rounded-xl px-6 text-sm font-bold ${tema.btnPrimario}`}>
          ➕ Crear mi primer servicio
        </button>
      </div>
    );
  }

  if (visibles.length === 0) {
    return (
      <div className={`${caja} p-10 text-center`}>
        <p className="text-3xl">🔍</p>
        <p className="mt-3 font-bold">Sin resultados</p>
        <p className={`mt-1 text-sm ${tema.texto2}`}>Ningún servicio coincide con la búsqueda o el filtro elegido.</p>
        <button type="button" onClick={onLimpiarFiltros} className={`mt-5 h-11 rounded-xl px-6 text-sm font-bold ${tema.btnPrimario}`}>
          Limpiar filtros
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`${caja} adm-scroll hidden overflow-x-auto md:block`}>
        <table className="w-full">
          <thead className={tema.suave}>
            <tr>
              <th className={th}>Servicio</th>
              <th className={th}>Duración</th>
              <th className={th}>Precio</th>
              <th className={th}>Estado</th>
              <th className={th}>Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${tema.divisor}`}>
            {visibles.map((s) => (
              <tr key={s.id} className={`transition-colors ${tema.filaHover} ${busyId === s.id ? "opacity-60" : ""}`}>
                <td className="px-4 py-3">
                  <div className="font-semibold">{s.nombre}</div>
                  {s.descripcion && <div className={`mt-0.5 text-xs ${tema.texto2}`}>{s.descripcion}</div>}
                </td>
                <td className={`px-4 py-3 text-sm ${tema.texto2}`}>{duracionTexto(s.duracion_min)}</td>
                <td className="px-4 py-3 text-sm font-bold tabular-nums">{money(s.precio)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tema.badge(s.activo)}`}>
                    {s.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onEditar(s)} className="rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-500 transition-colors hover:bg-blue-500/25">
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      disabled={busyId === s.id}
                      onClick={() => onToggle(s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        s.activo
                          ? "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25"
                          : "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                      }`}
                    >
                      {s.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button type="button" onClick={() => onEliminar(s)} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/25">
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {visibles.map((s) => (
          <ServicioCard
            key={s.id}
            tema={tema}
            servicio={s}
            ocupado={busyId === s.id}
            onEditar={() => onEditar(s)}
            onToggle={() => onToggle(s)}
            onEliminar={() => onEliminar(s)}
          />
        ))}
      </div>
    </>
  );
}