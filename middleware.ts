import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verificarToken } from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const cookie = request.cookies.get("admin_auth");

    // ✅ Valida la firma HMAC (hoy o ayer)
    if (!(await verificarToken(cookie?.value))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*"],
};
