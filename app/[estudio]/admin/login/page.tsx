import { obtenerEstudioPorSlug } from '@/lib/estudios';
import LoginCliente from './LoginCliente';

export default async function LoginEstudioPage({
  params,
}: {
  params: Promise<{ estudio: string }>;
}) {
  const { estudio: slug } = await params;
  const estudio = await obtenerEstudioPorSlug(slug);

  if (!estudio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Estudio no encontrado</p>
      </div>
    );
  }

  return (
    <LoginCliente
      estudio={{
        slug: estudio.slug,
        nombre: estudio.nombre,
        logo_url: estudio.logo_url,
        color_primario: estudio.color_primario,
      }}
    />
  );
}