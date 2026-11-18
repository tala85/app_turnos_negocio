// Service Worker de SoRo Estética Admin — App Shell offline
const VERSION = 'soro-v2';
const STATIC = `${VERSION}-static`;   // JS/CSS/fuentes/íconos (hash estables en prod)
const HTML = `${VERSION}-html`;       // páginas navegadas (network-first)

// Instalación: tomar control inmediato
self.addEventListener('install', () => self.skipWaiting());

// Activación: limpiar cachés de versiones viejas
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

// Página offline mínima (evita el dinosaurio hasta la 1ª visita)
const OFFLINE_HTML = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SoRo Admin</title></head><body style="font-family:system-ui;background:#111827;color:#f9fafb;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center"><div style="max-width:320px"><div style="font-size:56px">📶</div><h2 style="margin:12px 0">Sin conexión</h2><p style="color:#9ca3af;margin:0">Conectate a internet para abrir la app por primera vez. Después vas a poder usarla offline.</p></div></body></html>`;

// Estrategia 1: cache-first (para assets con hash → JS, CSS, fuentes, imágenes)
async function cacheFirst(req) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

// Estrategia 2: network-first con fallback a cache (para HTML de navegación)
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

  // ❌ API, pasarela y redirecciones: NUNCA cachear (datos en vivo / pagos)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/pago/') ||
      url.hostname.includes('mercadopago') || url.hostname.includes('ngrok')) {
    return; // deja que la request pase normal (falla si no hay internet, y está bien)
  }

  // ✅ Solo GET
  if (req.method !== 'GET') return;

  // ✅ Assets estáticos (hash estables en producción → cache-first)
  if (url.pathname.startsWith('/_next/static/') ||
      /\.(woff2?|png|jpg|jpeg|svg|ico|webp|css|js)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // ✅ Navegación (HTML de páginas) → network-first + fallback
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, HTML));
    return;
  }

  // ✅ Resto (fetch de datos del cliente, etc.) → network-first
  event.respondWith(networkFirst(req, STATIC));
});