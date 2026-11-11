"use client";

import Link from "next/link";
import { ADMIN_CSS, type Tema } from "@/lib/admin/tema";

export type NavLink = {
  href: string;
  label: string;
  icono: string;
  color: "emerald" | "fuchsia" | "blue" | "pink";
};

const COLORES: Record<NavLink["color"], string> = {
  emerald: "border-emerald-500 text-emerald-600 hover:bg-emerald-500/10",
  fuchsia: "border-fuchsia-500 text-fuchsia-600 hover:bg-fuchsia-500/10",
  blue: "border-blue-500 text-blue-600 hover:bg-blue-500/10",
  pink: "border-pink-500 text-pink-600 hover:bg-pink-500/10",
};

type Props = {
  tema: Tema;
  icono: string;
  titulo: string;
  subtitulo: string;
  links: NavLink[];
};

export default function AdminHeader({ tema, icono, titulo, subtitulo, links }: Props) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ADMIN_CSS }} />

      <header className={`${tema.tarjeta} mb-4 rounded-2xl border ${tema.borde} p-4 shadow-sm sm:mb-6 sm:p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-xl shadow-lg shadow-pink-500/25">
              {icono}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold sm:text-2xl">{titulo}</h1>
              <p className={`truncate text-xs sm:text-sm ${tema.texto2}`}>{subtitulo}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={tema.alternar}
            aria-label={tema.oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg transition-all ${
              tema.oscuro
                ? "bg-amber-400 text-gray-900 hover:bg-amber-300"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {tema.oscuro ? "☀️" : "🌙"}
          </button>
        </div>

        <nav className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl border-2 px-3 text-sm font-semibold transition-colors ${COLORES[l.color]}`}
            >
              <span>{l.icono}</span>
              {l.label}
            </Link>
          ))}

          <Link
            href="/"
            className={`col-span-2 flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors sm:col-span-1 ${tema.btnNeutro}`}
          >
            ← Inicio
          </Link>
        </nav>
      </header>
    </>
  );
}