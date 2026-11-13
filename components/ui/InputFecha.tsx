"use client";

import { useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  required?: boolean;
  inputClass: string;
};

export default function InputFecha({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  min,
  required,
  inputClass,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const abrirCalendario = () => {
    const input = inputRef.current;
    if (!input) return;

    // ✅ API moderna: fuerza a abrir el picker nativo
    // (Chrome, Edge, Safari 14.5+, Firefox 101+)
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        // Si el navegador no lo permite (ej: click fuera de gesto de usuario),
        // al menos enfocamos el input
        input.focus();
      }
    } else {
      // Fallback para navegadores viejos
      input.focus();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border px-3 pr-11 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 ${inputClass}`}
      />
      {/* Botón calendario superpuesto */}
      <button
        type="button"
        onClick={abrirCalendario}
        aria-label="Abrir calendario"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-pink-500/10 hover:text-pink-500 transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>
    </div>
  );
}
