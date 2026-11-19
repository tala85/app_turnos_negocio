// Service Worker de SoRo Estética Admin — App Shell offline + Push
const VERSION = "soro-v3";
const STATIC = `${VERSION}-static`;
const HTML = `${VERSION}-html`;

const RUTAS_ADMIN = [
  "/admin/reservas",
  "/admin/servicios",
  "/admin/combos",
  "/admin/horarios",
  "/admin/configuracion",
  "/admin/compartir",
  "/admin/login",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(HTML)
      .then((cache) =>
        Promise.all(
          RUTAS_ADMIN.map((ruta) =>
            fetch(ruta, { cache: "no-store" })
              .then((res) => {
                if (res.ok) cache.put(ruta, res);
              })
              .catch(() => console.warn(`[SW] No se pudo precachear ${ruta}`)),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const OFFLINE_HTML = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SoRo Admin</title></head><body style="font-family:system-ui;background:#111827;color:#f9fafb;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center"><div style="max-width:320px"><div style="font-size:56px">📶</div><h2 style="margin:12px 0">Sin conexión</h2><p style="color:#9ca3af;margin:0">Conectate a internet para abrir la app por primera vez. Después vas a poder usarla offline.</p></div></body></html>`;

async function cacheFirst(req) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return new Response("", { status: 204 });
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req);
    return (
      hit ||
      (req.mode === "navigate"
        ? new Response(OFFLINE_HTML, {
            headers: { "Content-Type": "text/html" },
          })
        : Response.error())
    );
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/pago/") ||
    url.hostname.includes("mercadopago") ||
    url.hostname.includes("ngrok")
  ) {
    return;
  }

  if (req.method !== "GET") return;

  if (
    url.pathname.startsWith("/_next/static/") ||
    /\.(woff2?|png|jpg|jpeg|svg|ico|webp|css|js)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, HTML));
    return;
  }

  event.respondWith(networkFirst(req, STATIC));
});

// ═══════════════════════════════════════════════════
// 🔔 PUSH: recibir notificación y mostrarla
// ═══════════════════════════════════════════════════
self.addEventListener("push", (event) => {
  let data = {
    titulo: "SoRo Estética",
    cuerpo: "Tenés una novedad",
    url: "/admin/reservas",
  };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* payload vacío → usar defaults */
  }

  event.waitUntil(
    self.registration.showNotification(data.titulo, {
      body: data.cuerpo,
      icon: "/icon.png",
      badge: "/icon.png",
      tag: data.tag || "soro",
      data: { url: data.url },
    }),
  );
});

// ═══════════════════════════════════════════════════
// 🔔 PUSH: click en la notificación → abrir la app
// ═══════════════════════════════════════════════════
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin/reservas";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((lista) => {
        // Si ya hay una pestaña de la app, enfocarla en vez de abrir otra
        for (const client of lista) {
          if (client.url.includes(url) && "focus" in client)
            return client.focus();
        }
        return self.clients.openWindow(url);
      }),
  );
});
