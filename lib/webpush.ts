import * as webpush from "web-push";
import { adminDb } from "@/lib/supabase/admin";

let inicializado = false;

function asegurarConfig() {
  if (inicializado) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@soro.com";
  if (!publicKey || !privateKey) {
    throw new Error(
      "Faltan claves VAPID (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)",
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  inicializado = true;
}

export type PayloadNotificacion = {
  titulo: string;
  cuerpo: string;
  url?: string;
  tag?: string;
};

export async function enviarNotificacionAEstudio(
  estudioId: string,
  payload: PayloadNotificacion,
) {
  asegurarConfig();

  const { data: suscripciones, error } = await adminDb
    .from("suscripciones_push")
    .select("id, endpoint, p256dh, auth")
    .eq("estudio_id", estudioId)
    .eq("activa", true);

  if (error) throw error;
  if (!suscripciones || suscripciones.length === 0) {
    return { enviado: 0, desactivadas: 0 };
  }

  let enviado = 0;
  const idsMuertos: string[] = [];

  for (const sub of suscripciones) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      );
      enviado++;
    } catch (e: unknown) {
      // 404/410 = suscripción muerta (desinstalada, navegador viejo) → desactivar
      const statusCode = (e as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        idsMuertos.push(sub.id);
      } else {
        console.error(
          "[webpush] error enviando:",
          statusCode,
          (e as Error)?.message,
        );
      }
    }
  }

  // 🧹 Auto-limpieza: no dejar suscripciones zombis en la BD
  if (idsMuertos.length > 0) {
    await adminDb
      .from("suscripciones_push")
      .update({ activa: false })
      .in("id", idsMuertos);
  }

  return { enviado, desactivadas: idsMuertos.length };
}
