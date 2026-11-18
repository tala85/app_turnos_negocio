const VERSION = 'soro-v2';
const STATIC = `${VERSION}-static`;
const HTML = `${VERSION}-html`;

// Rutas críticas del admin que deben funcionar offline
const RUTAS_ADMIN = [
  '/admin/reservas',
  '/admin/servicios',
  '/admin/combos',
  '/admin/horarios',
  '/admin/configuracion',
  '/admin/compartir',
  '/admin/login',
];

self.addEventListener('install', (event) => {
  // Precachear rutas admin críticas durante la instalación
  event.waitUntil(
    caches.open(HTML).then((cache) =>
      Promise.all(
        RUTAS_ADMIN.map((ruta) =>
          fetch(ruta, { cache: 'no-store' })
            .then((res) => {
              if (res.ok) cache.put(ruta, res);
            })
            .catch(() => {
              // Silencioso: si falla, se cachea en la primera visita real
              console.warn(`[SW] No se pudo precachear ${ruta}`);
            })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fallback HTML elegante
const OFFLINE_HTML = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SoRo Admin</title></head><body style="font-family:system-ui;background:#111827;color:#f9fafb;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center"><div style="max-width:320px"><div style="font-size:56px">📶</div><h2 style="margin:12px 0">Sin conexión</h2><p style="color:#9ca3af;margin:0">Conectate a internet para abrir la app por primera vez. Después vas a poder usarla offline.</p></div></body></html>`;

// Cache-first con manejo de errores (para assets)
async function cacheFirst(req) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    // Si falla el fetch (ej: favicon.ico), devolver respuesta vacía en vez de romper
    return new Response('', { status: 204 });
  }
}

// Network-first con fallback (para HTML)
async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req);
    return hit || (req.mode === 'navigate'
      ? new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html' } })
      : Response.error());
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Nunca cachear API, pagos, ni dominios externos
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/pago/') ||
      url.hostname.includes('mercadopago') || url.hostname.includes('ngrok')) {
    return;
  }

  if (req.method !== 'GET') return;

  // Assets estáticos (hash estables)
  if (url.pathname.startsWith('/_next/static/') ||
      /\.(woff2?|png|jpg|jpeg|svg|ico|webp|css|js)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Navegación (HTML)
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, HTML));
    return;
  }

  event.respondWith(networkFirst(req, STATIC));
});