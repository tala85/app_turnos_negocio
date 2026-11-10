import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estudioId = searchParams.get('estudioId');
  const fecha = searchParams.get('fecha');
  const duracionMin = searchParams.get('duracionMin');

  if (!estudioId || !fecha || !duracionMin) {
    return NextResponse.json(
      { ok: false, mensaje: 'Faltan parámetros' },
      { status: 400 }
    );
  }

  try {
    const { data: horarios, error } = await adminDb.rpc('horarios_disponibles', {
      p_estudio_id: estudioId,
      p_fecha: fecha,
      p_duracion_min: parseInt(duracionMin),
    });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      horarios: horarios || [],
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al cargar horarios';
    console.error('[horarios-inicio]', e);
    return NextResponse.json(
      { ok: false, mensaje },
      { status: 500 }
    );
  }
}