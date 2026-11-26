"use client";

import { useEffect, useState } from "react";
import MetricCard from "../MetricCard";

type Metricas = {
  totalEstudios: number;
  reservasEsteMes: number;
  ingresos: number;
  tasaConversion: number;
  topEstudios: { nombre: string; cantidad: number }[];
};

// Formatea números como moneda argentina sin decimales: 279600 → "$ 279.600"
const fmtARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export default function MetricasClient() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch("/api/super-admin/metricas")
      .then((r) => r.json())
      .then((data) => {
        if (!vivo) return;
        if (data.ok) setMetricas(data.metricas);
        else setError(data.mensaje || "Error al cargar métricas");
      })
      .catch(() => vivo && setError("Error de conexión"));
    return () => {
      vivo = false;
    };
  }, []);

  if (error)
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-300">
        {error}
      </div>
    );

  if (!metricas)
    return <p className="text-slate-400 animate-pulse">Cargando métricas…</p>;

  // La conversión cambia de color según su salud: verde ≥70, ámbar ≥40, rosa <40
  const colorConv =
    metricas.tasaConversion >= 70
      ? "emerald"
      : metricas.tasaConversion >= 40
        ? "amber"
        : "pink";

  const maxTop = metricas.topEstudios[0]?.cantidad ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Resumen general de la plataforma TurnosPro
        </p>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          titulo="Estudios registrados"
          valor={metricas.totalEstudios}
          icono="🏢"
          color="violet"
        />
        <MetricCard
          titulo="Reservas (30 días)"
          valor={metricas.reservasEsteMes}
          icono="📋"
          color="blue"
        />
        <MetricCard
          titulo="Ingresos (30 días)"
          valor={fmtARS.format(metricas.ingresos)}
          icono="💰"
          color="emerald"
        />
        <MetricCard
          titulo="Tasa de conversión"
          valor={`${metricas.tasaConversion}%`}
          icono="📈"
          color={colorConv}
        />
      </div>

      {/* Top estudios con barras relativas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          🏆 Top estudios por reservas
        </h2>

        {metricas.topEstudios.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Aún no hay reservas en los últimos 30 días.
          </p>
        ) : (
          <div className="space-y-3">
            {metricas.topEstudios.map((e, i) => (
              <div key={e.nombre} className="flex items-center gap-4">
                <span className="w-6 text-slate-500 text-sm font-bold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white font-medium">{e.nombre}</span>
                    <span className="text-slate-400">{e.cantidad}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
                      style={{
                        width: `${(e.cantidad / maxTop) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
