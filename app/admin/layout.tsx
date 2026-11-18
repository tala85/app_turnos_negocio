import OfflineBanner from "@/components/admin/OfflineBanner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Este banner solo se renderiza dentro de cualquier ruta /admin/* */}
      <OfflineBanner />
      {children}
      {/* Si tenés algún Footer de admin, iría acá */}
    </>
  );
}