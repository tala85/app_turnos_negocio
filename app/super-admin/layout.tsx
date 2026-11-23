import SuperAdminNav from "./SuperAdminNav";

export default function SuperAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar desktop + Topbar mobile (se maneja solo con responsive) */}
      <SuperAdminNav />

      {/* Contenido principal: con padding para no quedar tapado por el sidebar fijo */}
      <main className="lg:pl-64 pt-24 lg:pt-0">
        <div className="p-6 sm:p-10">{children}</div>
      </main>
    </div>
  );
}
