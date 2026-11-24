"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from "react";
import type { Tema } from "@/lib/admin/tema";
import {
  DURACIONES,
  type FormDatos,
  type Servicio,
} from "@/features/servicios/types";
import { duracionTexto } from "@/features/servicios/utils";
import Image from "next/image";

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
  tema,
  editando,
  datos,
  setDatos,
  valido,
  guardando,
  visible,
  setVisible,
  onSubmit,
  onCancelar,
  formRef,
  nombreRef,
}: Props) {
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState("");

  const label = `mb-1 block text-xs font-semibold uppercase tracking-wide ${tema.texto2}`;
  const campo = `h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${tema.input}`;

  // ✅ Sube la imagen al instante y guarda la URL pública en datos.imagen_url
  const manejarImagen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorImagen("");

    if (file.size > 1048576) {
      setErrorImagen("La imagen no puede pesar más de 1 MB");
      e.target.value = "";
      return;
    }

    setSubiendoImagen(true);
    try {
      const fd = new FormData();
      fd.append("imagen", file);
      const res = await fetch("/api/admin/servicios/imagen", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.ok) {
        setDatos({ ...datos, imagen_url: data.url });
      } else {
        setErrorImagen(data.mensaje || "Error al subir la imagen");
      }
    } catch {
      setErrorImagen("Error de conexión al subir");
    } finally {
      setSubiendoImagen(false);
      e.target.value = "";
    }
  };

  return (
    <section
      ref={formRef}
      className={`${tema.tarjeta} mb-4 scroll-mt-4 overflow-hidden rounded-2xl border ${tema.borde} shadow-sm sm:mb-6`}
    >
      <div
        className={`flex items-center justify-between gap-3 p-4 sm:p-5 ${editando ? "bg-gradient-to-r from-blue-500/10 to-transparent" : ""}`}
      >
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
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-4 px-4 pb-4 sm:grid-cols-2 sm:px-5 sm:pb-5"
        >
          <div className="sm:col-span-2">
            <label htmlFor="svc-nombre" className={label}>
              Nombre del servicio
            </label>
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
            <label htmlFor="svc-desc" className={label}>
              Descripción breve
            </label>
            <input
              id="svc-desc"
              type="text"
              value={datos.descripcion}
              onChange={(e) =>
                setDatos({ ...datos, descripcion: e.target.value })
              }
              placeholder="Ej: Incluye limado, cutícula y esmaltado"
              maxLength={140}
              className={campo}
            />
          </div>

          {/* ✅ NUEVO: Imagen del servicio */}
          <div className="sm:col-span-2">
            <label className={label}>Imagen del servicio (opcional)</label>
            <div
              className={`flex items-center gap-4 rounded-xl border p-3 ${tema.borde} ${tema.suave}`}
            >
              {datos.imagen_url ? (
                <Image
                  src={datos.imagen_url}
                  alt="Vista previa del servicio"
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-lg object-contain bg-gray-50 p-1"
                  unoptimized
                />
              ) : (
                <div
                  className={`grid h-16 w-16 shrink-0 place-items-center rounded-lg border text-2xl ${tema.tarjeta} ${tema.borde}`}
                >
                  💅
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1.5">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={manejarImagen}
                  disabled={subiendoImagen}
                  className="block w-full cursor-pointer rounded-lg border text-xs file:mr-3 file:cursor-pointer file:border-0 file:bg-pink-500/15 file:px-3 file:py-2 file:text-xs file:font-medium file:text-pink-500 disabled:opacity-50"
                />
                {subiendoImagen && (
                  <p className={`text-xs ${tema.texto2}`}>Subiendo imagen…</p>
                )}
                {errorImagen && (
                  <p className="text-xs font-medium text-red-500">
                    {errorImagen}
                  </p>
                )}
                {datos.imagen_url && !subiendoImagen && (
                  <button
                    type="button"
                    onClick={() => setDatos({ ...datos, imagen_url: "" })}
                    className="text-xs font-medium text-red-500 hover:text-red-600"
                  >
                    🗑️ Quitar imagen
                  </button>
                )}
              </div>
            </div>
            <p className={`mt-1 text-xs ${tema.texto2}`}>
              PNG, JPG o WebP · máx 1 MB. Se muestra como miniatura en la
              vitrina de reservas.
            </p>
          </div>

          <div>
            <label htmlFor="svc-precio" className={label}>
              Precio
            </label>
            <div className="relative">
              <span
                className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${tema.texto2}`}
              >
                $
              </span>
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
            <label htmlFor="svc-duracion" className={label}>
              Duración (minutos)
            </label>
            <input
              id="svc-duracion"
              type="number"
              inputMode="numeric"
              min={5}
              step={5}
              value={datos.duracion_min}
              onChange={(e) =>
                setDatos({ ...datos, duracion_min: e.target.value })
              }
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
                  onClick={() =>
                    setDatos({ ...datos, duracion_min: String(d) })
                  }
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
              disabled={!valido || guardando || subiendoImagen}
              className={`h-12 flex-1 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ${tema.btnPrimario}`}
            >
              {guardando
                ? "Guardando..."
                : editando
                  ? "💾 Actualizar servicio"
                  : "💾 Guardar servicio"}
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
              Completá un nombre de al menos 2 caracteres, un precio válido y
              una duración de 5 minutos o más.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
