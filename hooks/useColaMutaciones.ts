"use client";

import { useState, useEffect, useCallback } from "react";
import {
  agregarMutacion,
  obtenerMutacionesPendientes,
  eliminarMutacion,
} from "@/lib/db";
import { useOnlineStatus } from "./useOnlineStatus";

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

  // Procesar la cola contra el servidor
  const procesarCola = useCallback(async () => {
    const muts = await obtenerMutacionesPendientes();
    if (muts.length === 0) return false;

    for (const m of muts) {
      try {
        const res = await fetch(`/api/admin/reservas/${m.reservaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado: m.tipo === "confirmar" ? "confirmada" : "cancelada",
          }),
        });
        const data = await res.json();
        if (data.ok && m.id != null) {
          await eliminarMutacion(m.id);
        } else {
          break; // si algo falla, dejamos el resto en cola
        }
      } catch {
        break; // se cayó la conexión otra vez
      }
    }
    return true;
  }, []);

  // Al volver la conexión → procesar y refrescar
  useEffect(() => {
    if (!isOnline) return;
    let cancelado = false;
    const run = async () => {
      const habia = await procesarCola();
      if (habia && !cancelado) window.location.reload();
    };
    run();
    return () => {
      cancelado = true;
    };
  }, [isOnline, procesarCola]);

  // Encolar una mutación (cuando estamos offline)
  const encolar = useCallback(
    async (tipo: "confirmar" | "cancelar", reservaId: string) => {
      await agregarMutacion({ tipo, reservaId });
      setPendientes((prev) => new Set(prev).add(reservaId));
    },
    [],
  );

  return { pendientes, encolar };
}
