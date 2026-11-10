import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estudioId = searchParams.get('estudioId');
  const inicio = searchParams.get('inicio');
  const cantidad = searchParams.get('cantidad');

  if (!estudioId || !inicio || !cantidad) {
    return NextResponse.json(
      { ok: false, mensaje: 'Faltan parámetros' },
      { status: 400 }
    );
  }

  try {
    // Validar que la fecha sea válida
    const inicioDate = new Date(inicio);
    if (isNaN(inicioDate.getTime())) {
      return NextResponse.json(
        { ok: false, mensaje: 'Fecha de inicio inválida' },
        { status: 400 }
      );
    }

    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return NextResponse.json(
        { ok: false, mensaje: 'Cantidad de slots inválida' },
        { status: 400 }
      );
    }

    // Calcular la fecha fin sumando los slots necesarios
    const finDate = new Date(inicioDate.getTime() + cantidadNum * 30 * 60 * 1000);

    const { data: turnos, error } = await adminDb
      .from('turnos')
      .select('id')
      .eq('estudio_id', estudioId)
      .gte('inicio', inicioDate.toISOString())
      .lt('inicio', finDate.toISOString())
      .eq('estado', 'libre')
      .order('inicio');

    if (error) throw error;

    if (turnos.length < cantidadNum) {
      return NextResponse.json(
        { ok: false, mensaje: 'No hay suficientes slots disponibles' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      turnoIds: turnos.map((t) => t.id),
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al obtener slots';
    console.error('[slots]', e);
    return NextResponse.json(
      { ok: false, mensaje },
      { status: 500 }
    );
  }
}