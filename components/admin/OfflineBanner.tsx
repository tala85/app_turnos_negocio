"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  // ✅ Corregido: usamos isMounted (con "is" al principio)
  const { isOnline, isMounted } = useOnlineStatus();

  // No renderizar nada hasta que el cliente montó y estamos offline
  if (!isMounted || isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg animate-pulse">
      📶 Sin conexión — Trabajando con datos en caché. Los cambios se sincronizarán al recuperar la conexión.
    </div>
  );
}