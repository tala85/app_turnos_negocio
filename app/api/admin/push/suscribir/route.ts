import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';
import { verificarAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!(await verificarAdmin())) {
    return NextResponse.json({ ok: false, mensaje: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { estudioId, suscripcion } = body;

    if (!estudioId || !suscripcion?.endpoint) {
      return NextResponse.json({ ok: false, mensaje: 'Faltan datos' }, { status: 400 });
    }

    // Insertar o actualizar (UPSERT) para evitar duplicados
    const { error } = await adminDb
      .from('suscripciones_push')
      .upsert({
        estudio_id: estudioId,
        endpoint: suscripcion.endpoint,
        p256dh: suscripcion.keys.p256dh,
        auth: suscripcion.keys.auth,
        activa: true,
      }, {
        onConflict: 'endpoint',
      });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al suscribir';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}