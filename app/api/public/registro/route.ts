import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';
import { hashearPassword } from '@/lib/estudios';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, slug, password } = body;

    // 1. Validaciones básicas
    if (!nombre || !slug || !password || password.length < 6) {
      return NextResponse.json(
        { ok: false, mensaje: 'Nombre, slug y contraseña (mín. 6 caracteres) son obligatorios' },
        { status: 400 }
      );
    }

    const slugLimpio = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (slugLimpio.length < 3) {
      return NextResponse.json(
        { ok: false, mensaje: 'El slug debe tener al menos 3 caracteres válidos' },
        { status: 400 }
      );
    }

    // 2. Verificar que el slug no exista
    const { data: existente } = await adminDb.from('estudios').select('id').eq('slug', slugLimpio).single();
    if (existente) {
      return NextResponse.json(
        { ok: false, mensaje: 'Ese nombre de usuario (slug) ya está en uso. Probá con otro.' },
        { status: 409 }
      );
    }

    // 3. Leer defaults globales del Super Admin (con fallback seguro)
    const { data: cfg } = await adminDb.from('plataforma_config').select('*').eq('id', 'global').single();
    const c = cfg || {
      slogan_default: 'Tu belleza, nuestra pasión',
      color_primario: '#ec4899',
      color_secundario: '#8b5cf6',
      color_fondo: '#f1f5f9',
      sena_porcentaje: 30,
      minutos_bloqueo: 10,
      paso_minutos: 30,
      horario_inicio: '09:00',
      horario_fin: '18:00',
      dias_atencion: [1, 2, 3, 4, 5], // Lunes a Viernes
    };

    const nuevoEstudioId = randomUUID();
    const passwordHash = hashearPassword(password);

    // 4. Insertar el estudio usando los defaults del Super Admin
    const { error: errorEstudio } = await adminDb.from('estudios').insert({
      id: nuevoEstudioId,
      nombre: nombre.trim(),
      slug: slugLimpio,
      slogan: c.slogan_default,
      color_primario: c.color_primario,
      color_secundario: c.color_secundario,
      color_fondo: c.color_fondo,
      sena_porcentaje: Number(c.sena_porcentaje),
      minutos_bloqueo: Number(c.minutos_bloqueo),
      paso_minutos: Number(c.paso_minutos),
      admin_password_hash: passwordHash,
    }).select().single();

    if (errorEstudio) {
      console.error('[registro] Error en Supabase:', errorEstudio);
      return NextResponse.json({ ok: false, mensaje: 'Error al crear el estudio.' }, { status: 500 });
    }

    // 5. Crear un servicio de ejemplo
    await adminDb.from('servicios').insert({
      estudio_id: nuevoEstudioId,
      nombre: 'Servicio de Ejemplo',
      descripcion: 'Podés editar o borrar este servicio desde el panel',
      precio: 5000,
      duracion_min: Number(c.paso_minutos),
      activo: true,
    });

    // 6. Configurar horarios por defecto (usando los días y horas del Super Admin)
    const horariosPorDefecto = c.dias_atencion.map((dia: number) => ({
      estudio_id: nuevoEstudioId,
      dia_semana: dia,
      hora_inicio: c.horario_inicio,
      hora_fin: c.horario_fin,
      activo: true,
    }));
    await adminDb.from('horarios_trabajo').insert(horariosPorDefecto);

    // 7. Generar agenda de turnos para los próximos 30 días
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const slotsParaInsertar = [];
    
    // Parsear horas de inicio y fin para el loop
    const [hIni, mIni] = c.horario_inicio.split(':').map(Number);
    const [hFin, mFin] = c.horario_fin.split(':').map(Number);
    const inicioMinutos = hIni * 60 + mIni;
    const finMinutos = hFin * 60 + mFin;

    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = fecha.getDay();
      
      if (c.dias_atencion.includes(diaSemana)) {
        for (let minutos = inicioMinutos; minutos + Number(c.paso_minutos) <= finMinutos; minutos += Number(c.paso_minutos)) {
          const horaInicio = Math.floor(minutos / 60);
          const minInicio = minutos % 60;
          const horaFinSlot = Math.floor((minutos + Number(c.paso_minutos)) / 60);
          const minFinSlot = (minutos + Number(c.paso_minutos)) % 60;

          const inicio = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), horaInicio, minInicio, 0));
          const fin = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), horaFinSlot, minFinSlot, 0));
          
          slotsParaInsertar.push({
            estudio_id: nuevoEstudioId,
            inicio: inicio.toISOString(),
            fin: fin.toISOString(),
            estado: 'libre'
          });
        }
      }
    }

    if (slotsParaInsertar.length > 0) {
      await adminDb.from('turnos').insert(slotsParaInsertar);
    }

    return NextResponse.json({ ok: true, mensaje: 'Estudio creado con éxito', slug: slugLimpio });

  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error interno del servidor';
    console.error('[registro] Excepción:', e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}