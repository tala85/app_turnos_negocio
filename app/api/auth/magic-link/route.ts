import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDb } from "@/lib/supabase/admin";
import { generarMagicToken } from "@/lib/auth-token";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  // Mensaje SEGURO: siempre el mismo, exista o no el email (anti-enumeración)
  const mensajeSeguro = {
    ok: true,
    mensaje:
      "Si existe una cuenta con ese email, te enviamos un enlace de acceso.",
  };

  try {
    const { email, slug } = await req.json();

    if (!email || !email.includes("@") || !slug) {
      return NextResponse.json(
        { ok: false, mensaje: "Ingresá un email válido" },
        { status: 400 },
      );
    }

    // 🔒 Doble candado: buscamos el estudio POR SLUG y verificamos el email
    const { data: estudio } = await adminDb
      .from("estudios")
      .select("id, nombre, email")
      .eq("slug", slug)
      .single();

    // Si no existe el estudio, o el email no coincide → respondemos lo mismo
    if (
      !estudio ||
      estudio.email?.toLowerCase() !== email.trim().toLowerCase()
    ) {
      return NextResponse.json(mensajeSeguro);
    }

    // Token de 15 minutos firmado (no se guarda en BD, se autodestruye)
    const token = await generarMagicToken(estudio.id, 15);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    // ✅ El link ahora apunta a la ruta per-estudio del verify
    const link = `${appUrl}/${slug}/admin/login/verify?token=${token}`;

    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || "TurnosPro <onboarding@resend.dev>",
      to: estudio.email,
      subject: `Tu enlace de acceso a ${estudio.nombre}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
          <h2 style="margin:0 0 12px">🔑 Enlace de acceso</h2>
          <p style="color:#555;margin:0 0 20px">
            Solicitaste entrar al panel de <strong>${estudio.nombre}</strong>.
            Este enlace vence en <strong>15 minutos</strong>.
          </p>
          <a href="${link}"
             style="display:inline-block;background:#ec4899;color:#fff;
                    padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">
            Entrar al panel
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px">
            Si no pediste este acceso, ignorá este email.
          </p>
        </div>
      `,
    });

    return NextResponse.json(mensajeSeguro);
  } catch (e: unknown) {
    console.error("[magic-link]", e);
    // Aunque falle, NO filtramos el error interno: respondemos el mensaje seguro
    return NextResponse.json(mensajeSeguro);
  }
}
