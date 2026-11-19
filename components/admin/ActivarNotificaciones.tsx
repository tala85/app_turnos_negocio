"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useState } from "react";

export default function ActivarNotificaciones({
  estudioId,
}: {
  estudioId: string;
}) {
  const { estado, error, solicitarPermiso } = usePushNotifications(estudioId);
  const [pruebaError, setPruebaError] = useState<string | null>(null);

  // ✅ Servidor y cliente renderizan EXACTAMENTE lo mismo en el primer paint:
  // el estado inicial es "inicializando" en ambos → CERO hydration mismatch
  if (estado === "inicializando") {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-500">
        ⏳ Verificando notificaciones...
      </div>
    );
  }

  if (estado === "no-soportado") {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
        🔕 Tu navegador no soporta notificaciones push.
      </div>
    );
  }

  if (estado === "suscrito") {
    const enviarPrueba = async () => {
      setPruebaError(null);
      try {
        const res = await fetch("/api/admin/push/prueba", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estudioId }),
        });

        // ✅ Manejo robusto: si no es 200, NO intentar parsear JSON
        if (!res.ok) {
          const texto = await res.text(); // leer como texto primero
          console.error(
            "[push] prueba falló:",
            res.status,
            texto.slice(0, 200),
          );
          setPruebaError(
            `Error ${res.status}: la API no respondió correctamente. ¿Existe app/api/admin/push/prueba/route.ts?`,
          );
          return;
        }

        const data = await res.json();
        console.log("[push] prueba →", data);
        if (!data.ok) {
          setPruebaError(data.mensaje || "Error al enviar la prueba");
        } else {
          setPruebaError(`✅ Enviada a ${data.enviado} dispositivo(s).`);
        }
      } catch (e: unknown) {
        setPruebaError(e instanceof Error ? e.message : "Error de red");
      }
    };

    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <span className="text-sm text-emerald-700 dark:text-emerald-400">
            ✅ Notificaciones activadas. Vas a recibir alertas cuando un cliente
            reserve.
          </span>
          {pruebaError && (
            <p
              className={`text-xs mt-1 ${pruebaError.startsWith("✅") ? "text-emerald-600" : "text-red-600"}`}
            >
              {pruebaError}
            </p>
          )}
        </div>
        <button
          onClick={enviarPrueba}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          📤 Enviar prueba
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🔔</div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
            Activá las notificaciones
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
            Recibí una alerta cuando un cliente reserve y pague la seña.
          </p>
          <button
            onClick={solicitarPermiso}
            disabled={estado === "solicitando"}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {estado === "solicitando"
              ? "Activando..."
              : "Activar notificaciones"}
          </button>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
