"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Tema } from "@/lib/admin/tema";

type Props = {
  abierto: boolean;
  tema: Tema;
  icono?: string;
  titulo: string;
  children: ReactNode;
  advertencia?: string;
  textoConfirmar?: string;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export default function ConfirmDialog({
  abierto,
  tema,
  icono = "🗑️",
  titulo,
  children,
  advertencia,
  textoConfirmar = "Sí, eliminar",
  cargando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const cancelarRef = useRef(onCancelar);

  useEffect(() => {
    cancelarRef.current = onCancelar;
  }, [onCancelar]);

  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelarRef.current();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancelar} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        className={`adm-sheet relative w-full rounded-t-3xl border ${tema.borde} ${tema.tarjeta} p-5 shadow-2xl sm:max-w-md sm:rounded-2xl`}
      >
        <div className={`mx-auto mb-4 h-1.5 w-12 rounded-full sm:hidden ${tema.oscuro ? "bg-gray-600" : "bg-gray-300"}`} />

        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-500/15 text-xl">
            {icono}
          </span>
          <div className="min-w-0">
            <h3 id="confirm-titulo" className="text-lg font-bold">{titulo}</h3>
            <div className={`mt-1 text-sm ${tema.texto2}`}>{children}</div>
          </div>
        </div>

        {advertencia && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-medium text-amber-600">
            {advertencia}
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            disabled={cargando}
            onClick={onCancelar}
            className={`h-12 flex-1 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${tema.btnNeutro}`}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={onConfirmar}
            className="h-12 flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:brightness-110 disabled:opacity-60"
          >
            {cargando ? "Procesando..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}