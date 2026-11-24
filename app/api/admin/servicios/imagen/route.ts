import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/supabase/admin";
import { obtenerEstudioDeSesion } from "@/lib/auth";
import { randomUUID } from "crypto";

const noAutorizado = () =>
  NextResponse.json({ ok: false, mensaje: "No autorizado" }, { status: 401 });

export async function POST(req: NextRequest) {
  const estudioId = await obtenerEstudioDeSesion();
  if (!estudioId) return noAutorizado();

  try {
    const formData = await req.formData();
    const imagen = formData.get("imagen") as File | null;

    if (!imagen || imagen.size === 0) {
      return NextResponse.json({ ok: false, mensaje: "No se recibió imagen" }, { status: 400 });
    }
    if (imagen.size > 1048576) {
      return NextResponse.json({ ok: false, mensaje: "La imagen no puede pesar más de 1 MB" }, { status: 400 });
    }

    const ext = imagen.name.split(".").pop()?.toLowerCase() || "png";
    if (!["png", "jpg", "jpeg", "webp"].includes(ext)) {
      return NextResponse.json({ ok: false, mensaje: "Formato no soportado (PNG, JPG o WebP)" }, { status: 400 });
    }

    // Path aislado por estudio: logos/{estudioId}/servicios/{uuid}.ext
    const fileName = `${estudioId}/servicios/${randomUUID()}.${ext}`;

    const { error: uploadError } = await adminStorage
      .from("logos")
      .upload(fileName, imagen, { contentType: imagen.type });

    if (uploadError) throw uploadError;

    const { data: urlData } = adminStorage.from("logos").getPublicUrl(fileName);

    return NextResponse.json({ ok: true, url: urlData.publicUrl });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : "Error al subir imagen";
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}