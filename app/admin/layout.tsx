import OfflineBanner from "@/components/admin/OfflineBanner";
import SWRegister from "@/components/admin/SWRegister";
import { verificarModoSoporte } from "@/lib/super-admin-auth";
import { obtenerEstudioDeSesion } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import ModoSoporteBanner from "@/components/admin/ModoSoporteBanner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Verificar si estamos en modo soporte (Super Admin impersonando)
  const enModoSoporte = await verificarModoSoporte();
  const estudioId = await obtenerEstudioDeSesion();

  let nombreEstudio: string | null = null;
  if (enModoSoporte && estudioId) {
    const { data } = await adminDb
      .from("estudios")
      .select("nombre")
      .eq("id", estudioId)
      .single();
    nombreEstudio = data?.nombre ?? null;
  }

  return (
    <>
      <SWRegister />
      <OfflineBanner />
      {enModoSoporte && nombreEstudio && (
        <ModoSoporteBanner nombre={nombreEstudio} />
      )}
      {children}
    </>
  );
}
