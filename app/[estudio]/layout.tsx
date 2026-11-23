import type { Metadata } from "next";
import { obtenerEstudioPorSlug } from "@/lib/estudios";

type Props = {
  children: React.ReactNode;
  params: Promise<{ estudio: string }>;
};

// ✅ Definimos un tipo local que incluya las propiedades que sabemos que existen en la BD
type EstudioMetadata = {
  nombre: string;
  slogan?: string;
  logo_url?: string | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { estudio: slug } = await params;
  
  // ✅ Usamos 'unknown' y luego lo casteamos a nuestro tipo definido. 
  // Esto satisface a ESLint porque no usamos 'any', pero le damos a TS la info que necesita.
  const estudio = (await obtenerEstudioPorSlug(slug)) as unknown as EstudioMetadata;

  if (!estudio) {
    return {
      title: "Estudio no encontrado | TurnosPro",
    };
  }

  return {
    title: `${estudio.nombre} | Turnos online`,
    description:
      estudio.slogan ||
      `Reservá tu turno en ${estudio.nombre}. Rápido, fácil y con confirmación por WhatsApp.`,
    openGraph: {
      title: `${estudio.nombre} | Turnos online`,
      description: estudio.slogan || `Turnos online en ${estudio.nombre}`,
      images: estudio.logo_url ? [estudio.logo_url] : undefined,
    },
    // ✅ Favicon dinámico: el logo del estudio en la pestaña del navegador
    icons: estudio.logo_url ? { icon: estudio.logo_url } : undefined,
  };
}

export default function EstudioLayout({ children }: Props) {
  return <>{children}</>;
}