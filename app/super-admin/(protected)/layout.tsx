import { redirect } from 'next/navigation';
import { verificarSuperAdmin } from '@/lib/super-admin-auth';
import SuperAdminNav from '../SuperAdminNav';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Solo las rutas DENTRO de (protected) exigen sesión
  const autenticado = await verificarSuperAdmin();
  if (!autenticado) redirect('/super-admin/login');

  return (
    <>
      <SuperAdminNav />
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </>
  );
}