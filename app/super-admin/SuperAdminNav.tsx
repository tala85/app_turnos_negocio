"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/super-admin', label: 'Dashboard', icono: '📊' },
  { href: '/super-admin/estudios', label: 'Estudios', icono: '🏢' },
  { href: '/super-admin/actividad', label: 'Actividad', icono: '📈' },
  { href: '/super-admin/config', label: 'Configuración', icono: '⚙️' },
];

export default function SuperAdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const cerrarSesion = async () => {
    await fetch('/api/super-admin/logout', { method: 'POST' });
    router.push('/super-admin/login');
  };

  return (
    <>
      {/* SIDEBAR (desktop) */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <p className="font-bold text-white">Super Admin</p>
              <p className="text-xs text-slate-400">TurnosPro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const activo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activo
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span>{link.icono}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/plataforma"
            className="block text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Ver plataforma pública
          </Link>
          <button
            onClick={cerrarSesion}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* TOPBAR (mobile) */}
      <header className="lg:hidden fixed top-0 inset-x-0 bg-slate-900 border-b border-slate-800 z-20">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <p className="font-bold text-sm">Super Admin</p>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-xs text-red-400"
          >
            Salir
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3">
          {links.map((link) => {
            const activo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activo
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400'
                }`}
              >
                {link.icono} {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}