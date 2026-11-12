"use client";

import Link from "next/link";
import { ADMIN_CSS, type Tema } from "@/lib/admin/tema";

export type NavLink = {
  href: string;
  label: string;
  icono: string;
  color: "emerald" | "fuchsia" | "blue" | "pink" | "purple";
};

const COLORES: Record<NavLink["color"], string> = {
  emerald:
    "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
  fuchsia:
    "border-fuchsia-500/40 text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-500/10",
  blue: "border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10",
  pink: "border-pink-500/40 text-pink-600 dark:text-pink-400 hover:bg-pink-500/10",
  purple:
    "border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10",
};

type Props = {
  tema: Tema;
  icono: string;
  titulo: string;
  subtitulo: string;
  links: NavLink[];
};

export default function AdminHeader({
  tema,
  icono,
  titulo,
  subtitulo,
  links,
}: Props) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ADMIN_CSS }} />

      <header
        className={`${tema.tarjeta} mb-6 rounded-2xl border ${tema.borde} p-4 sm:p-5 shadow-sm`}
      >
        {/* Fila superior: Título + botón modo oscuro */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* Ícono del módulo */}
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-lg shadow-sm shadow-pink-500/20">
              {icono}
            </span>
            <div className="min-w-0">
              <h1
                className={`truncate text-xl sm:text-2xl font-semibold tracking-tight ${tema.texto}`}
              >
                {titulo}
              </h1>
              <p className={`truncate text-sm ${tema.texto2} mt-0.5`}>
                {subtitulo}
              </p>
            </div>
          </div>

          {/* Botón modo oscuro (más compacto) */}
          <button
            type="button"
            onClick={tema.alternar}
            aria-label={
              tema.oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
            }
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base transition-all ${
              tema.oscuro
                ? "bg-amber-400/20 text-amber-400 hover:bg-amber-400/30"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tema.oscuro ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Navegación: botones "pill" minimalistas */}
        <nav className="flex flex-wrap gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${COLORES[l.color]}`}
            >
              <span className="text-sm">{l.icono}</span>
              {l.label}
            </Link>
          ))}

          <Link
            href="/"
            className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${tema.borde} ${tema.texto2} hover:${tema.texto}`}
          >
            ← Inicio
          </Link>
        </nav>
      </header>
    </>
  );
}
