import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';
import { hashearPassword } from '@/lib/estudios';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, slug, password, color_primario, color_secundario, color_fondo } = body;

    // 1. Validaciones básicas
    if (!nombre || !slug || !password || password.length < 6) {
      return NextResponse.json(
        { ok: false, mensaje: 'Nombre, slug y contraseña (mín. 6 caracteres) son obligatorios' },
        { status: 400 }
      );
    }

    // El slug debe ser solo letras minúsculas, números y guiones
    const slugLimpio = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (slugLimpio.length < 3) {
      return NextResponse.json(
        { ok: false, mensaje: 'El slug debe tener al menos 3 caracteres válidos (letras, números o guiones)' },
        { status: 400 }
      );
    }

    // 2. Verificar que el slug no exista ya
    const { data: existente } = await adminDb
      .from('estudios')
      .select('id')
      .eq('slug', slugLimpio)
      .single();

    if (existente) {
      return NextResponse.json(
        { ok: false, mensaje: 'Ese nombre de usuario (slug) ya está en uso. Probá con otro.' },
        { status: 409 }
      );
    }

    // 3. Generar datos del nuevo estudio
    const nuevoEstudioId = randomUUID();
    const passwordHash = hashearPassword(password);

    // 4. Insertar en la base de datos
    const { error } = await adminDb
      .from('estudios')
      .insert({
        id: nuevoEstudioId,
        nombre: nombre.trim(),
        slug: slugLimpio,
        slogan: 'Tu belleza, nuestra pasión', // Valor por defecto
        color_primario: color_primario || '#ec4899',
        color_secundario: color_secundario || '#8b5cf6',
        color_fondo: color_fondo || '#fafafa',
        admin_password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) {
      console.error('[registro] Error en Supabase:', error);
      return NextResponse.json(
        { ok: false, mensaje: 'Error al crear el estudio. Intentá de nuevo.' },
        { status: 500 }
      );
    }

    // 5. (Opcional pero recomendado) Crear un servicio de ejemplo para que no esté vacío
    await adminDb.from('servicios').insert({
      estudio_id: nuevoEstudioId,
      nombre: 'Servicio de Ejemplo',
      descripcion: 'Podés editar o borrar este servicio desde el panel',
      precio: 5000,
      duracion_min: 30,
      activo: true,
    });

    return NextResponse.json({ 
      ok: true, 
      mensaje: 'Estudio creado con éxito',
      slug: slugLimpio 
    });

  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error interno del servidor';
    console.error('[registro] Excepción:', e);
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}