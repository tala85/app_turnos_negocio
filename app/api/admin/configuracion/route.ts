import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/supabase/admin";

// GET: Obtener configuración del estudio
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
    .from("estudios")
    .select("*")
    .eq("id", estudioId)
    .single();

  if (error)
    return NextResponse.json(
      { ok: false, mensaje: error.message },
      { status: 500 },
    );

  return NextResponse.json({ ok: true, data });
}

// PUT: Actualizar configuración (incluye logo)
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const estudioId = formData.get("estudioId") as string;
    const nombre = formData.get("nombre") as string;
    const slogan = formData.get("slogan") as string;
    const colorPrimario = formData.get("colorPrimario") as string;
    const colorSecundario = formData.get("colorSecundario") as string;
    const colorFondo = formData.get("colorFondo") as string;
    const logo = formData.get("logo") as File | null;

    // 🔍 LOG DE DEPURACIÓN
    console.log("=== DATOS RECIBIDOS EN EL API ===");
    console.log("estudioId:", estudioId);
    console.log("nombre:", nombre);
    console.log("slogan:", slogan);

    if (!estudioId) {
      return NextResponse.json(
        { ok: false, mensaje: "Falta estudioId" },
        { status: 400 },
      );
    }

    let logoUrl: string | undefined;

    // Si se subió un logo, subirlo a Supabase Storage
    if (logo && logo.size > 0) {
      const extension = logo.name.split(".").pop() || "png";
      const fileName = `${estudioId}/logo.${extension}`;

      const { error: uploadError } = await adminStorage
        .from("logos")
        .upload(fileName, logo, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = adminStorage
        .from("logos")
        .getPublicUrl(fileName);

      logoUrl = urlData.publicUrl;
    }

    // Preparar datos a actualizar
    const datosActualizados: Record<string, string> = {
      nombre: nombre || "Belleza Posadas",
      slogan: slogan || "",
      color_primario: colorPrimario,
      color_secundario: colorSecundario,
      color_fondo: colorFondo,
    };

    if (logoUrl) {
      datosActualizados.logo_url = logoUrl;
    }

    const { data, error } = await adminDb
      .from("estudios")
      .update(datosActualizados)
      .eq("id", estudioId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al actualizar";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}
