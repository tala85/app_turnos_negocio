type Props = {
  titulo: string;
  valor: string | number;
  icono: string;
  detalle?: string;
  color?: 'pink' | 'blue' | 'emerald' | 'amber' | 'violet';
};

const colores = {
  pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20 text-pink-400',
  blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
  emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
  violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400',
};

export default function MetricCard({ titulo, valor, icono, detalle, color = 'pink' }: Props) {
  return (
    <div className={`bg-gradient-to-br ${colores[color]} border rounded-2xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{icono}</span>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{valor}</p>
      <p className="text-sm text-slate-300 font-medium">{titulo}</p>
      {detalle && <p className="text-xs text-slate-400 mt-2">{detalle}</p>}
    </div>
  );
}