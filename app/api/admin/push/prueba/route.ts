import { NextRequest, NextResponse } from 'next/server';
import { verificarAdmin } from '@/lib/auth';
import { enviarNotificacionAEstudio } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  if (!(await verificarAdmin())) {
    return NextResponse.json({ ok: false, mensaje: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { estudioId } = body;
    if (!estudioId) {
      return NextResponse.json({ ok: false, mensaje: 'Falta estudioId' }, { status: 400 });
    }

    const resultado = await enviarNotificacionAEstudio(estudioId, {
      titulo: '🔔 Notificación de prueba',
      cuerpo: 'Si ves esto, el circuito de push funciona completo.',
      url: '/admin/reservas',
      tag: 'prueba',
    });

    return NextResponse.json({ ok: true, ...resultado });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error interno';
    console.error('[push/prueba]', e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}