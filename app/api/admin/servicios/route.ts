import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { verificarAdmin } from "@/lib/auth";

// GET: Obtener servicios de un estudio
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const estudioId = searchParams.get("estudioId");

  if (!estudioId) {
    return NextResponse.json(
      { ok: false, mensaje: "Falta estudioId" },
      { status: 400 },
    );
  }

  const { data, error } = await adminDb
    .from("servicios")
    .select("*")
    .eq("estudio_id", estudioId)
    .order("orden", { ascending: true });

  if (error)
    return NextResponse.json(
      { ok: false, mensaje: error.message },
      { status: 500 },
    );

  return NextResponse.json({ ok: true, data });
}

// POST: Crear un nuevo servicio
export async function POST(req: Request) {
  if (!(await verificarAdmin())) {
    return NextResponse.json(
      { ok: false, mensaje: "No autorizado" },
      { status: 401 },
    );
  }
  try {
    const body = await req.json();
    const { estudio_id, nombre, descripcion, precio, duracion_min, activo } =
      body;

    const { data, error } = await adminDb
      .from("servicios")
      .insert({
        estudio_id,
        nombre,
        descripcion,
        precio,
        duracion_min,
        activo: activo ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al crear servicio";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

// PATCH: Actualizar un servicio
export async function PATCH(req: Request) {
  if (!(await verificarAdmin())) {
    return NextResponse.json(
      { ok: false, mensaje: "No autorizado" },
      { status: 401 },
    );
  }
  try {
    const body = await req.json();
    const { id, ...datosActualizados } = body;

    const { data, error } = await adminDb
      .from("servicios")
      .update(datosActualizados)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al actualizar";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}

// DELETE: Eliminar un servicio
export async function DELETE(req: Request) {
  if (!(await verificarAdmin())) {
    return NextResponse.json(
      { ok: false, mensaje: "No autorizado" },
      { status: 401 },
    );
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, mensaje: "Falta id" },
        { status: 400 },
      );
    }

    const { error } = await adminDb.from("servicios").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true, mensaje: "Servicio eliminado" });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al eliminar";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
