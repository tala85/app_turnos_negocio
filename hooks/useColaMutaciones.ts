"use client";

import { useState, useEffect, useCallback } from "react";
import {
  agregarMutacion,
  obtenerMutacionesPendientes,
  eliminarMutacion,
  dbPut,
  STORES,
} from "@/lib/db";
import { useOnlineStatus } from "./useOnlineStatus";

const MAX_INTENTOS = 3;

export function useColaMutaciones() {
  const { isOnline } = useOnlineStatus();
  const [pendientes, setPendientes] = useState<Set<string>>(new Set());

  // Cargar la cola pendiente al montar
  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        const muts = await obtenerMutacionesPendientes();
        if (!cancelado && muts.length) {
          setPendientes(new Set(muts.map((m) => m.reservaId)));
        }
      } catch (e) {
        console.error("[cola] error cargando:", e);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  // Procesa la cola y devuelve CUÁNTAS se aplicaron con éxito
  const procesarCola = useCallback(async (): Promise<number> => {
    const muts = await obtenerMutacionesPendientes();
    if (muts.length === 0) return 0;

    let procesadas = 0;

    for (const m of muts) {
      const intentos = m.intentos || 0;

      // 🛡️ Mutación zombi: tras 3 intentos fallidos se descarta y no bloquea más
      if (intentos >= MAX_INTENTOS) {
        console.warn(
          "[cola] mutación descartada tras",
          intentos,
          "intentos:",
          m,
        );
        if (m.id != null) await eliminarMutacion(m.id);
        continue;
      }

      try {
        const res = await fetch(`/api/admin/reservas/${m.reservaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado: m.tipo === "confirmar" ? "confirmada" : "cancelada",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.ok && m.id != null) {
            await eliminarMutacion(m.id);
            procesadas++;
            continue;
          }
        }

        // Fallo de servidor (401/404/500): sumamos un intento
        await dbPut(STORES.COLA_MUTACIONES, { ...m, intentos: intentos + 1 });
        if (res.status === 401) break; // sesión caída: reintentar no sirve
      } catch {
        break; // se cortó la red de nuevo: la mutación queda para después
      }
    }

    return procesadas;
  }, []);

  // Al volver la conexión → procesar. SOLO recargar si se aplicó algo.
  useEffect(() => {
    if (!isOnline) return;
    let cancelado = false;
    const run = async () => {
      try {
        const procesadas = await procesarCola();
        // ✅ FIX DEL BUCLE: recargamos SOLO si hubo éxito real
        if (procesadas > 0 && !cancelado) window.location.reload();
      } catch (e) {
        console.error("[cola] error procesando:", e);
      }
    };
    run();
    return () => {
      cancelado = true;
    };
  }, [isOnline, procesarCola]);

  const encolar = useCallback(
    async (tipo: "confirmar" | "cancelar", reservaId: string) => {
      await agregarMutacion({ tipo, reservaId });
      setPendientes((prev) => new Set(prev).add(reservaId));
    },
    [],
  );

  return { pendientes, encolar };
}
