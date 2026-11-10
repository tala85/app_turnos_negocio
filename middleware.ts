import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Contraseña del admin (cambiala por una segura)
const ADMIN_PASSWORD = 'admin123';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo proteger rutas /admin (excepto /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const cookie = request.cookies.get('admin_auth');

    if (!cookie || cookie.value !== ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};