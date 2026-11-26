const encoder = new TextEncoder();

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Payload legible pero firmado: "estudioId|fecha"
function encodePayload(estudioId: string, fecha: Date): string {
  const raw = `${estudioId}|${fecha.toISOString().slice(0, 10)}`;
  return btoa(raw); // ascii seguro (uuid + fecha)
}

function decodePayload(
  payload: string,
): { estudioId: string; fecha: string } | null {
  try {
    const raw = atob(payload);
    const [estudioId, fecha] = raw.split("|");
    if (!estudioId || !fecha) return null;
    return { estudioId, fecha };
  } catch {
    return null;
  }
}

export async function generarToken(estudioId: string): Promise<string> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET no definido");
  const payload = encodePayload(estudioId, new Date());
  const firma = await hmacHex(payload, secret);
  return `${payload}.${firma}`;
}

export type SesionAdmin = { estudioId: string };

export async function verificarToken(
  token: string | undefined,
): Promise<SesionAdmin | null> {
  if (!token || !process.env.ADMIN_SECRET) return null;

  const [payload, firma] = token.split(".");
  if (!payload || !firma) return null;

  const datos = decodePayload(payload);
  if (!datos) return null;

  // La fecha del payload debe ser hoy o ayer (tolerancia de medianoche)
  const hoy = new Date().toISOString().slice(0, 10);
  const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  if (datos.fecha !== hoy && datos.fecha !== ayer) return null;

  // La firma debe coincidir con el payload recibido
  const firmaEsperada = await hmacHex(payload, process.env.ADMIN_SECRET);
  if (firma !== firmaEsperada) return null;

  return { estudioId: datos.estudioId };
}

// ── Magic Link: token de corta duración (15 min) ──────────────
// Payload: "estudioId|expiracionISO"  (expiración = ahora + 15 min)

export async function generarMagicToken(
  estudioId: string,
  minutosVida = 15,
): Promise<string> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET no definido");

  const expira = new Date(Date.now() + minutosVida * 60 * 1000);
  const raw = `${estudioId}|${expira.toISOString()}`;
  const payload = btoa(raw);
  const firma = await hmacHex(payload, secret);
  return `${payload}.${firma}`;
}

export async function verificarMagicToken(
  token: string | undefined,
): Promise<SesionAdmin | null> {
  if (!token || !process.env.ADMIN_SECRET) return null;

  const [payload, firma] = token.split(".");
  if (!payload || !firma) return null;

  // La firma debe coincidir (si adulteraron el estudioId o la expiración, falla)
  const firmaEsperada = await hmacHex(payload, process.env.ADMIN_SECRET);
  if (firma !== firmaEsperada) return null;

  // Decodificamos y chequeamos que NO haya expirado
  try {
    const raw = atob(payload);
    const [estudioId, expiraISO] = raw.split("|");
    if (!estudioId || !expiraISO) return null;

    if (Date.now() > new Date(expiraISO).getTime()) {
      return null; // el link ya murió (pasaron los 15 min)
    }

    return { estudioId };
  } catch {
    return null;
  }
}
