"use client";

import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function tiempoDesde(iso: string | null): string {
  if (!iso) return "nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace instantes";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} días`;
}

export default function SyncStatus({ ultimoSync }: { ultimoSync: string | null }) {
  const { isOnline, isMounted } = useOnlineStatus();
  const [, forzarRender] = useState(0);

  // Actualiza el "hace X" cada minuto mientras hay conexión
  useEffect(() => {
    if (!isOnline) return;
    const id = setInterval(() => forzarRender((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, [isOnline]);

  if (!isMounted) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={isOnline ? "text-emerald-500" : "text-amber-400"}>
        {isOnline ? "🟢" : "🟡"}
      </span>
      <span className="opacity-70">
        {isOnline
          ? `Sincronizado ${tiempoDesde(ultimoSync)}`
          : `Datos de ${tiempoDesde(ultimoSync)} (offline)`}
      </span>
    </div>
  );
}