/* eslint-disable react-hooks/set-state-in-effect */
// Desactivamos esta regla para este archivo porque el patrón "mounted flag"
// es la solución oficial de React para evitar hydration mismatches en SSR.

"use client";

import { useState, useEffect } from "react";

export function useOnlineStatus() {
  // 1. Siempre arrancamos en true para que el servidor y el cliente coincidan en el primer render
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 2. Marcamos que el cliente ya montó
    setIsMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, isMounted };
}
