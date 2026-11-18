"use client";

import { useState, useEffect } from "react";
import {
  dbPutAll,
  dbGetAll,
  setUltimoSync,
  getUltimoSync,
  STORES,
} from "@/lib/db";
import { useOnlineStatus } from "./useOnlineStatus";

export function useReservasSync<T extends { id: string }>(reservas: T[]) {
  const { isOnline } = useOnlineStatus();
  const [ultimoSync, setUltimoSyncState] = useState<string | null>(null);
  const [reservasCache, setReservasCache] = useState<T[] | null>(null);
  const [listo, setListo] = useState(false);

  // 1. Leer el cache local al montar (para tener respaldo offline)
  useEffect(() => {
    let cancelado = false;
    const leer = async () => {
      try {
        const ts = await getUltimoSync();
        const cache = await dbGetAll<T>(STORES.RESERVAS);
        if (!cancelado) {
          setUltimoSyncState(ts);
          setReservasCache(cache.length ? cache : null);
          setListo(true);
        }
      } catch (e) {
        console.error("[useReservasSync] error leyendo cache:", e);
        if (!cancelado) setListo(true);
      }
    };
    leer();
    return () => {
      cancelado = true;
    };
  }, []);

  // 2. Persistir en IndexedDB cuando hay conexión (setState post-await → permitido)
  useEffect(() => {
    if (!isOnline || reservas.length === 0) return;
    let cancelado = false;
    const persistir = async () => {
      try {
        await dbPutAll(STORES.RESERVAS, reservas);
        await setUltimoSync();
        if (!cancelado) setUltimoSyncState(new Date().toISOString());
      } catch (e) {
        console.error("[useReservasSync] error persistiendo:", e);
      }
    };
    persistir();
    return () => {
      cancelado = true;
    };
  }, [isOnline, reservas]);

  return { ultimoSync, reservasCache, listo, isOnline };
}