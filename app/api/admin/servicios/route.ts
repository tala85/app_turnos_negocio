import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { obtenerEstudioDeSesion } from "@/lib/auth";

const noAutorizado = () =>
  NextResponse.json({ ok: false, mensaje: "No autorizado" }, { status: 401 });

export async function GET() {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  const { data, error } = await adminDb
    .from("servicios")
    .select("*")
    .eq("estudio_id", estudioId) // ← filtro de tenant desde la SESIÓN
    .order("nombre", { ascending: true });

  if (error)
    return NextResponse.json(
      { ok: false, mensaje: error.message },
      { status: 500 },
    );
  return NextResponse.json({ ok: true, data: data || [] });
}

export async function POST(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  const body = await req.json();
  const { nombre, descripcion, precio, duracion_min, activo, imagen_url } =
    body;

  const { data, error } = await adminDb
    .from("servicios")
    .insert({
      estudio_id: estudioId, // ← de la sesión, NUNCA del body
      nombre,
      descripcion,
      precio,
      duracion_min,
      activo: activo ?? true,
      imagen_url: imagen_url || null,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json(
      { ok: false, mensaje: error.message },
      { status: 500 },
    );
  return NextResponse.json({ ok: true, data });
}

export async function PATCH(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  const body = await req.json();
  const { id, ...cambios } = body;
  if (!id)
    return NextResponse.json(
      { ok: false, mensaje: "Falta id" },
      { status: 400 },
    );

  // Doble filtro: solo puede tocar filas de ESTE estudio
  const { data, error } = await adminDb
    .from("servicios")
    .update(cambios)
    .eq("id", id)
    .eq("estudio_id", estudioId)
    .select();

  if (error)
    return NextResponse.json(
      { ok: false, mensaje: error.message },
      { status: 500 },
    );
  if (!data || data.length === 0) {
    return NextResponse.json(
      { ok: false, mensaje: "No encontrado" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, data: data[0] });
}

export async function DELETE(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { ok: false, mensaje: "Falta id" },
      { status: 400 },
    );

  const { data, error } = await adminDb
    .from("servicios")
    .delete()
    .eq("id", id)
    .eq("estudio_id", estudioId)
    .select();

  if (error)
    return NextResponse.json(
      { ok: false, mensaje: error.message },
      { status: 500 },
    );
  if (!data || data.length === 0) {
    return NextResponse.json(
      { ok: false, mensaje: "No encontrado" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
