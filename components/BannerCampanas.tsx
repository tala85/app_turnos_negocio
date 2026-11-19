"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Campana = {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url?: string;
  tipo: "promo" | "jornada" | "urgente";
  combo_id?: string;
  servicio_id?: string;
  fecha_fin: string;
  cupos?: number;
  precio_especial?: number;
};

function diasRestantes(fechaFin: string): number {
  const fin = new Date(fechaFin).getTime();
  const hoy = Date.now();
  return Math.max(0, Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24)));
}

const estilosTipo = {
  promo: {
    bg: "bg-gradient-to-r from-pink-500 to-rose-500",
    badge: "bg-white/20 text-white",
    emoji: "🔥",
  },
  jornada: {
    bg: "bg-gradient-to-r from-violet-500 to-purple-600",
    badge: "bg-white/20 text-white",
    emoji: "✨",
  },
  urgente: {
    bg: "bg-gradient-to-r from-amber-500 to-orange-600",
    badge: "bg-white/20 text-white",
    emoji: "⚡",
  },
};

export default function BannerCampanas({
  estudioId,
  estudioSlug,
}: {
  estudioId: string;
  estudioSlug: string;
}) {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`/api/public/campanas?estudioId=${estudioId}`);
        const data = await res.json();
        if (data.ok) setCampanas(data.campanas);
      } catch (e) {
        console.error("Error cargando campañas:", e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [estudioId]);

  if (cargando || campanas.length === 0) return null;

  return (
    <div className="space-y-4">
      {campanas.map((c) => {
        const estilo = estilosTipo[c.tipo] || estilosTipo.promo;
        const dias = diasRestantes(c.fecha_fin);

        // Construye la URL con el combo o servicio preseleccionado si existe
        const urlReservar = c.combo_id
          ? `/${estudioSlug}/reservar?combo=${c.combo_id}`
          : c.servicio_id
            ? `/${estudioSlug}/reservar?servicio=${c.servicio_id}`
            : `/${estudioSlug}/reservar`;

        return (
          <Link
            key={c.id}
            href={urlReservar}
            className={`block ${estilo.bg} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{estilo.emoji}</span>
                  <h3 className="text-xl md:text-2xl font-bold">{c.titulo}</h3>
                </div>
                <p className="text-white/90 text-sm md:text-base mb-3">
                  {c.descripcion}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                  {c.precio_especial && (
                    <span
                      className={`${estilo.badge} px-3 py-1 rounded-full font-semibold`}
                    >
                      💰 ${c.precio_especial.toLocaleString("es-AR")}
                    </span>
                  )}
                  {c.tipo === "jornada" && c.cupos && (
                    <span
                      className={`${estilo.badge} px-3 py-1 rounded-full font-semibold`}
                    >
                      🎟️ {c.cupos} cupos
                    </span>
                  )}
                  <span
                    className={`${estilo.badge} px-3 py-1 rounded-full font-semibold`}
                  >
                    ⏰{" "}
                    {dias === 0
                      ? "¡Último día!"
                      : `${dias} día${dias > 1 ? "s" : ""} restante${dias > 1 ? "s" : ""}`}
                  </span>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end justify-center">
                <div className="bg-white/20 backdrop-blur rounded-full px-5 py-2.5 font-semibold text-sm hover:bg-white/30 transition-colors">
                  Reservar →
                </div>
              </div>
            </div>

            {/* Mobile: botón full width */}
            <div className="md:hidden mt-4">
              <div className="bg-white/20 backdrop-blur rounded-full px-5 py-2.5 font-semibold text-sm text-center hover:bg-white/30 transition-colors">
                Reservar ahora →
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
