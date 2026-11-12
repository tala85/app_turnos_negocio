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
    bg: o ? "bg-gray-900" : "bg-gray-100",
    tarjeta: o ? "bg-gray-800" : "bg-white",
    borde: o ? "border-gray-700" : "border-gray-200",
    texto: o ? "text-gray-100" : "text-gray-800",
    texto2: o ? "text-gray-400" : "text-gray-600",
    suave: o ? "bg-gray-700/40" : "bg-gray-50",
    divisor: o ? "divide-gray-700" : "divide-gray-100",
    filaHover: o ? "hover:bg-gray-700/40" : "hover:bg-gray-50",
    input: o
      ? "!bg-gray-800 !border-gray-600 !text-gray-100 placeholder:!text-gray-400"
      : "!bg-white !border-gray-300 !text-gray-900 placeholder:!text-gray-400",
    btnPrimario:
      "bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-[.99]",
    btnNeutro: o
      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300",
    badge: (activo: boolean) =>
      activo
        ? "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30"
        : o
          ? "bg-gray-600/40 text-gray-300 ring-1 ring-gray-500/40"
          : "bg-gray-200 text-gray-600 ring-1 ring-gray-300",
  };
}

export const ADMIN_CSS = `
.adm-scroll::-webkit-scrollbar{width:8px;height:8px}
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