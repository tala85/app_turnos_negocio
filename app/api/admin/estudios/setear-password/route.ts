import { NextRequest, NextResponse } from 'next/server';
import { verificarAdmin } from '@/lib/auth';
import { setearPasswordEstudio } from '@/lib/estudios';

export async function POST(req: NextRequest) {
  if (!(await verificarAdmin())) {
    return NextResponse.json({ ok: false, mensaje: 'No autorizado' }, { status: 401 });
  }

  try {
    const { estudioId, password } = await req.json();
    if (!estudioId || !password || password.length < 6) {
      return NextResponse.json(
        { ok: false, mensaje: 'Estudio y contraseña (mín. 6 caracteres) obligatorios' },
        { status: 400 }
      );
    }

    await setearPasswordEstudio(estudioId, password);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error interno';
    console.error('[estudios/setear-password]', e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}