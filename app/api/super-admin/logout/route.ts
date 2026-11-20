import { NextResponse } from 'next/server';
import { cerrarSesionSuperAdmin } from '@/lib/super-admin-auth';

export async function POST() {
  await cerrarSesionSuperAdmin();
  return NextResponse.json({ ok: true });
}