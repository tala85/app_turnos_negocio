import { useModoOscuro } from "@/hooks/useModoOscuro";

export type Tema = {
  oscuro: boolean;
  alternar: () => void;
  bg: string;
  tarjeta: string;
  borde: string;
  texto: string;
  texto2: string;
  suave: string;
  divisor: string;
  filaHover: string;
  input: string;
  btnPrimario: string;
  btnNeutro: string;
  badge: (activo: boolean) => string;
};

/** Llamar UNA sola vez por página y pasar el objeto `tema` por props. */
export function useTema(): Tema {
  const { modoOscuro, setModoOscuro } = useModoOscuro();
  const o = modoOscuro;

  return {
    oscuro: o,
    alternar: () => setModoOscuro(!o),
    // ✅ Refinado: bg-gray-50 es más suave y moderno que bg-gray-100
    bg: o ? "bg-gray-900" : "bg-gray-50",
    // ✅ Refinado: Agregamos shadow-sm sutil para profundidad sin ser pesado
    tarjeta: o
      ? "bg-gray-900 shadow-sm shadow-black/20"
      : "bg-white shadow-sm shadow-gray-200/50",
    borde: o ? "border-gray-800" : "border-gray-200",
    // ✅ Refinado: text-gray-900 (casi negro) es más elegante que gray-800
    texto: o ? "text-gray-100" : "text-gray-900",
    texto2: o ? "text-gray-400" : "text-gray-500",
    suave: o ? "bg-gray-800/50" : "bg-gray-50",
    divisor: o ? "divide-gray-800" : "divide-gray-100",
    filaHover: o ? "hover:bg-gray-800/50" : "hover:bg-gray-50/80",

    // ✅ Mantenemos los !important que arreglaron el bug, pero con rounded-lg (más profesional que xl)
    input: o
      ? "!bg-gray-900 !border-gray-700 !text-gray-100 placeholder:!text-gray-500 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
      : "!bg-white !border-gray-200 !text-gray-900 placeholder:!text-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500",

    // ✅ Refinado: Botón más compacto (h-10), esquinas menos redondeadas (rounded-lg) y gradiente sutil
    btnPrimario:
      "h-10 px-4 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-medium rounded-lg shadow-sm shadow-pink-500/20 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",

    // ✅ Refinado: rounded-lg y transición suave
    btnNeutro: o
      ? "h-10 px-4 bg-gray-800 text-gray-200 hover:bg-gray-700 rounded-lg transition-all duration-200 active:scale-[0.98]"
      : "h-10 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 active:scale-[0.98]",

    badge: (activo: boolean) =>
      activo
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 rounded-full px-2.5 py-0.5 text-xs font-medium"
        : o
          ? "bg-gray-700/50 text-gray-300 ring-1 ring-gray-600/50 rounded-full px-2.5 py-0.5 text-xs font-medium"
          : "bg-gray-100 text-gray-600 ring-1 ring-gray-200 rounded-full px-2.5 py-0.5 text-xs font-medium",
  };
}

export const ADMIN_CSS = `
.adm-scroll::-webkit-scrollbar{width:6px;height:6px}
.adm-scroll::-webkit-scrollbar-track{background:transparent}
.adm-scroll::-webkit-scrollbar-thumb{background:#ec4899;border-radius:99px}
.adm-scroll::-webkit-scrollbar-thumb:hover{background:#be185d}
.adm-scroll{scrollbar-width:thin;scrollbar-color:#ec4899 transparent}
@keyframes admIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes admToast{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
@keyframes admSheet{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
.adm-in{animation:admIn .3s ease-out both}
.adm-toast{animation:admToast .25s ease-out both}
.adm-sheet{animation:admSheet .3s cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion:reduce){.adm-in,.adm-toast,.adm-sheet{animation:none}}
`;
