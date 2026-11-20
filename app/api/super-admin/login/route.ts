import { NextRequest, NextResponse } from 'next/server';
import { crearSesionSuperAdmin } from '@/lib/super-admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { ok: false, mensaje: 'Falta la contraseña' },
        { status: 400 }
      );
    }

    const exito = await crearSesionSuperAdmin(password);
    if (!exito) {
      return NextResponse.json(
        { ok: false, mensaje: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error interno';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}