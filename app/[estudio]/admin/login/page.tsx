import { notFound } from "next/navigation";
import { obtenerEstudioPorSlug } from "@/lib/estudios";
import LoginCliente from "./LoginCliente";

export default async function LoginEstudioPage({
  params,
}: {
  params: Promise<{ estudio: string }>;
}) {
  const { estudio: slug } = await params;
  const estudio = await obtenerEstudioPorSlug(slug);

  if (!estudio) notFound();

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
