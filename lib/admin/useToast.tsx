"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastTipo = "ok" | "error" | "info";

export type ToastData = {
  id: number;
  tipo: ToastTipo;
  texto: string;
  deshacer?: () => void;
};

export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cerrar = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const mostrar = useCallback((t: Omit<ToastData, "id">) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ ...t, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), t.deshacer ? 8000 : 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { toast, mostrar, cerrar };
}

export function Toaster({
  toast,
  onCerrar,
}: {
  toast: ToastData | null;
  onCerrar: () => void;
}) {
  if (!toast) return null;

  const color =
    toast.tipo === "ok"
      ? "border-emerald-500/40 bg-emerald-600 text-white"
      : toast.tipo === "error"
        ? "border-red-500/40 bg-red-600 text-white"
        : "border-gray-600 bg-gray-900 text-white";

  const icono = toast.tipo === "ok" ? "✅" : toast.tipo === "error" ? "⚠️" : "🗑️";

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-3 sm:bottom-6 sm:top-auto"
    >
      <div
        className={`adm-toast pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${color}`}
      >
        <span className="text-lg leading-none">{icono}</span>
        <p className="flex-1 text-sm font-semibold">{toast.texto}</p>

        {toast.deshacer && (
          <button
            type="button"
            onClick={() => {
              toast.deshacer?.();
              onCerrar();
            }}
            className="shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-white/30"
          >
            Deshacer
          </button>
        )}

        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="shrink-0 rounded-lg px-1.5 text-sm opacity-70 transition-opacity hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}