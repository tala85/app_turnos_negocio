"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    // ✅ El Service Worker SOLO se registra en PRODUCCIÓN.
    // En desarrollo su cache desincroniza el HMR y causa
    // hydration mismatches + fetch events rechazados.
    if (process.env.NODE_ENV !== "production") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ SW registrado"))
        .catch((err) => console.error("❌ SW error:", err));
    }
  }, []);
  return null;
}