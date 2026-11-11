"use client";

import type { FormEvent, RefObject } from "react";
import type { Tema } from "@/lib/admin/tema";
import { DURACIONES, type FormDatos, type Servicio } from "@/features/servicios/types";
import { duracionTexto } from "@/features/servicios/utils";

type Props = {
  tema: Tema;
  editando: Servicio | null;
  datos: FormDatos;
  setDatos: (d: FormDatos) => void;
  valido: boolean;
  guardando: boolean;
  visible: boolean;
  setVisible: (v: boolean) => void;
  onSubmit: (e: FormEvent) => void;
  onCancelar: () => void;
  formRef: RefObject<HTMLDivElement | null>;
  nombreRef: RefObject<HTMLInputElement | null>;
};

export default function ServicioForm({
  tema, editando, datos, setDatos, valido, guardando,
  visible, setVisible, onSubmit, onCancelar, formRef, nombreRef,
}: Props) {
  const label = `mb-1 block text-xs font-semibold uppercase tracking-wide ${tema.texto2}`;
  const campo = `h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${tema.input}`;

  return (
    <section
      ref={formRef}
      className={`${tema.tarjeta} mb-4 scroll-mt-4 overflow-hidden rounded-2xl border ${tema.borde} shadow-sm sm:mb-6`}
    >
      <div className={`flex items-center justify-between gap-3 p-4 sm:p-5 ${editando ? "bg-gradient-to-r from-blue-500/10 to-transparent" : ""}`}>
        <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
          <span>{editando ? "✏️" : "➕"}</span>
          {editando ? "Editar servicio" : "Nuevo servicio"}
        </h2>
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors md:hidden ${tema.suave} ${tema.texto2}`}
        >
          {visible ? "Ocultar ▲" : "Mostrar ▼"}
        </button>
      </div>

      {visible && (
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 px-4 pb-4 sm:grid-cols-2 sm:px-5 sm:pb-5">
          <div className="sm:col-span-2">
            <label htmlFor="svc-nombre" className={label}>Nombre del servicio</label>
            <input
              id="svc-nombre"
              ref={nombreRef}
              type="text"
              value={datos.nombre}
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
              placeholder="Ej: Manicura semipermanente"
              maxLength={80}
              className={campo}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="svc-desc" className={label}>Descripción breve</label>
            <input
              id="svc-desc"
              type="text"
              value={datos.descripcion}
              onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
              placeholder="Ej: Incluye limado, cutícula y esmaltado"
              maxLength={140}
              className={campo}
            />
          </div>

          <div>
            <label htmlFor="svc-precio" className={label}>Precio</label>
            <div className="relative">
              <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${tema.texto2}`}>$</span>
              <input
                id="svc-precio"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={datos.precio}
                onChange={(e) => setDatos({ ...datos, precio: e.target.value })}
                placeholder="0"
                className={`${campo} pl-8`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="svc-duracion" className={label}>Duración (minutos)</label>
            <input
              id="svc-duracion"
              type="number"
              inputMode="numeric"
              min={5}
              step={5}
              value={datos.duracion_min}
              onChange={(e) => setDatos({ ...datos, duracion_min: e.target.value })}
              className={campo}
            />
          </div>

          <div className="adm-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:col-span-2">
            {DURACIONES.map((d) => {
              const sel = Number(datos.duracion_min) === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDatos({ ...datos, duracion_min: String(d) })}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all ${
                    sel
                      ? "border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-500/25"
                      : `${tema.borde} ${tema.suave} ${tema.texto2}`
                  }`}
                >
                  {duracionTexto(d)}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
            <button
              type="submit"
              disabled={!valido || guardando}
              className={`h-12 flex-1 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ${tema.btnPrimario}`}
            >
              {guardando ? "Guardando..." : editando ? "💾 Actualizar servicio" : "💾 Guardar servicio"}
            </button>
            {editando && (
              <button
                type="button"
                onClick={onCancelar}
                className={`h-12 rounded-xl px-6 text-sm font-bold transition-colors ${tema.btnNeutro}`}
              >
                Cancelar
              </button>
            )}
          </div>

          {!valido && datos.nombre.length > 0 && (
            <p className="text-xs font-medium text-amber-500 sm:col-span-2">
              Completá un nombre de al menos 2 caracteres, un precio válido y una duración de 5 minutos o más.
            </p>
          )}
        </form>
      )}
    </section>
  );
}