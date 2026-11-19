"use client";

import { useState, useEffect } from "react";

type EstadoPush =
  | "inicializando"
  | "no-soportado"
  | "sin-permiso"
  | "solicitando"
  | "suscrito"
  | "error";

export function usePushNotifications(estudioId: string) {
  const [estado, setEstado] = useState<EstadoPush>("inicializando");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    const verificar = async () => {
      console.log("[push] serviceWorker:", "serviceWorker" in navigator);
      console.log("[push] PushManager:", "PushManager" in window);
      console.log("[push] permission:", Notification.permission);

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (!cancelado) setEstado("no-soportado");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const suscripcion = await registration.pushManager.getSubscription();
        console.log(
          "[push] suscripcion navegador:",
          suscripcion ? suscripcion.endpoint : "NINGUNA",
        );

        if (suscripcion) {
          const ok = await guardarSuscripcion(suscripcion, estudioId);
          if (!cancelado) setEstado(ok ? "suscrito" : "error");
        } else {
          if (!cancelado) setEstado("sin-permiso");
        }
      } catch (e) {
        console.error("[push] error:", e);
        if (!cancelado) setEstado("sin-permiso");
      }
    };

    verificar();
    return () => {
      cancelado = true;
    };
  }, [estudioId]);

  const solicitarPermiso = async () => {
    setEstado("solicitando");
    setError(null);

    try {
      const permiso = await Notification.requestPermission();
      console.log("[push] requestPermission:", permiso);
      if (permiso !== "granted") {
        setEstado("sin-permiso");
        setError("Permiso denegado.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const suscripcion = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
        ),
      });
      console.log("[push] nueva suscripcion:", suscripcion.endpoint);

      const ok = await guardarSuscripcion(suscripcion, estudioId);
      if (ok) {
        setEstado("suscrito");
      } else {
        setEstado("error");
        setError("Falló guardar en el servidor. Mirá el log POST suscribir.");
      }
    } catch (e: unknown) {
      setEstado("error");
      setError(e instanceof Error ? e.message : "Error desconocido");
    }
  };

  return { estado, error, solicitarPermiso };
}

async function guardarSuscripcion(
  suscripcion: PushSubscription,
  estudioId: string,
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/push/suscribir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estudioId,
        suscripcion: {
          endpoint: suscripcion.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(suscripcion.getKey("p256dh")!),
            auth: arrayBufferToBase64(suscripcion.getKey("auth")!),
          },
        },
      }),
    });
    const data = await res.json();
    console.log("[push] POST suscribir →", res.status, data);
    return data.ok === true;
  } catch (e) {
    console.error("[push] POST ERROR:", e);
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
