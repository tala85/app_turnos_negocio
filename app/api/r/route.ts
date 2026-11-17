import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";
const SLUG = "belleza-posadas";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origen = searchParams.get('o') || 'directo';

  // 1. Registrar el click Y ESPERAR el resultado (para ver errores)
  const { error } = await adminDb
    .from('link_clicks')
    .insert({ estudio_id: ESTUDIO_ID, origen });

  if (error) {
    console.error('❌ Error registrando click:', error.message, error.code);
  } else {
    console.log(`✅ Click registrado: origen=${origen}`);
  }

  // 2. Redirigir SIEMPRE (aunque el registro falle)
  const url = new URL(`/${SLUG}/reservar`, request.url);
  return NextResponse.redirect(url);
}