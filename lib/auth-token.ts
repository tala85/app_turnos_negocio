const encoder = new TextEncoder();

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// El payload cambia cada día → la sesión caduca sola a las 24h
function getPayload(fecha: Date): string {
  return fecha.toISOString().slice(0, 10); // "2026-11-17"
}

export async function generarToken(): Promise<string> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET no definido');
  return hmacHex(getPayload(new Date()), secret);
}

export async function verificarToken(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.ADMIN_SECRET) return false;
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1); // tolera el cambio de medianoche
  const [tHoy, tAyer] = [
    await hmacHex(getPayload(hoy), process.env.ADMIN_SECRET),
    await hmacHex(getPayload(ayer), process.env.ADMIN_SECRET),
  ];
  return token === tHoy || token === tAyer;
}