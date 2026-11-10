import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estudioId = searchParams.get('estudioId');
  const fecha = searchParams.get('fecha');

  if (!estudioId || !fecha) {
    return NextResponse.json(
      { ok: false, mensaje: 'Faltan parámetros' },
      { status: 400 }
    );
  }

  try {
    // Calcular el rango de fechas (inicio y fin del día en UTC)
    const inicio = new Date(`${fecha}T00:00:00-03:00`).toISOString();
    const fin = new Date(`${fecha}T23:59:59-03:00`).toISOString();

    // Consultar la vista 'disponibilidad' que creamos en Supabase
    const { data: slots, error } = await adminDb
      .from('disponibilidad')
      .select('*')
      .eq('estudio_id', estudioId)
      .gte('inicio', inicio)
      .lt('inicio', fin)
      .order('inicio');

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      slots: slots || [],
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al cargar turnos';
    console.error('[turnos/disponibles]', e);
    return NextResponse.json(
      { ok: false, mensaje },
      { status: 500 }
    );
  }
}