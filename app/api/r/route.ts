import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug"); // ← Leemos el slug dinámicamente
  const origen = searchParams.get("o") || "directo";

  // Si no viene slug, redirigimos a la plataforma general
  if (!slug) {
    return NextResponse.redirect(new URL("/plataforma", request.url));
  }

  // Buscamos el ID real del estudio
  const { data: estudio } = await adminDb
    .from("estudios")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!estudio) {
    return NextResponse.redirect(new URL("/plataforma", request.url));
  }

  // Registramos el click con el ID correcto
  const { error } = await adminDb
    .from("link_clicks")
    .insert({ estudio_id: estudio.id, origen });

  if (error) {
    console.error("❌ Error registrando click:", error.message, error.code);
  } else {
    console.log(`✅ Click registrado: ${slug} origen=${origen}`);
  }

  // Redirigimos al estudio correcto
  return NextResponse.redirect(new URL(`/${slug}/reservar`, request.url));
}
