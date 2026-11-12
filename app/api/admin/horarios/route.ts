import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const estudioId = searchParams.get('estudioId');

  if (!estudioId) {
    return NextResponse.json({ ok: false, mensaje: 'Falta estudioId' }, { status: 400 });
  }

  try {
    const [horarios, excepciones] = await Promise.all([
      adminDb.from('horarios_trabajo').select('*').eq('estudio_id', estudioId).eq('activo', true).order('dia_semana'),
      adminDb.from('horarios_excepciones').select('*').eq('estudio_id', estudioId).order('fecha'),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        horarios: horarios.data || [],
        excepciones: excepciones.data || [],
      },
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al obtener horarios';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { estudioId, tipo, datos } = body;

    if (!estudioId || !tipo || !datos) {
      return NextResponse.json({ ok: false, mensaje: 'Faltan datos' }, { status: 400 });
    }

    if (tipo === 'horario') {
      const { data, error } = await adminDb
        .from('horarios_trabajo')
        .insert({
          estudio_id: estudioId,
          dia_semana: datos.dia_semana,
          hora_inicio: datos.hora_inicio,
          hora_fin: datos.hora_fin,
          activo: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ ok: true, data });

    } else if (tipo === 'excepcion') {
      const { data, error } = await adminDb
        .from('horarios_excepciones')
        .insert({
          estudio_id: estudioId,
          fecha: datos.fecha,
          hora_inicio: datos.hora_inicio,
          hora_fin: datos.hora_fin,
        })
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json({ ok: false, mensaje: 'Tipo inválido' }, { status: 400 });

  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al guardar';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const tipo = searchParams.get('tipo');

  if (!id || !tipo) {
    return NextResponse.json({ ok: false, mensaje: 'Faltan datos' }, { status: 400 });
  }

  try {
    const tabla = tipo === 'horario' ? 'horarios_trabajo' : 'horarios_excepciones';
    const { error } = await adminDb.from(tabla).delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al eliminar';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}