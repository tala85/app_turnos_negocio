"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "admin_modo_oscuro";

// Set de componentes suscriptores (para que todos se enteren cuando cambia)
const listeners = new Set<() => void>();

function notificarCambio() {
  listeners.forEach((listener) => listener());
}

// React usa esto para suscribirse a cambios externos
function subscribe(callback: () => void) {
  listeners.add(callback);

  // También escuchamos cambios desde OTRA pestaña del navegador
  const handler = () => callback();
  window.addEventListener("storage", handler);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handler);
  };
}

// Lo que se lee en el CLIENTE (después del mount)
function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

// Lo que se lee en el SERVIDOR (siempre false → modo claro)
// Esto es lo que evita el error de hidratación
function getServerSnapshot() {
  return false;
}

export function useModoOscuro() {
  // ✅ useSyncExternalStore maneja la hidratación automáticamente
  const modoOscuro = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setModoOscuro = useCallback((valor: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(valor));
    notificarCambio(); // Avisa a todos los componentes que usan este hook
  }, []);

  return { modoOscuro, setModoOscuro };
}
