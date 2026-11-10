import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ReservaForm from '@/components/ReservaForm';

// Cliente público para lecturas (funciona en build time y runtime)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateStaticParams() {
  try {
    const { data: estudios } = await supabase
      .from('estudios')
      .select('slug');

    return estudios?.map((e) => ({ estudio: e.slug })) ?? [{ estudio: 'belleza-posadas' }];
  } catch {
    return [{ estudio: 'belleza-posadas' }];
  }
}

export const dynamicParams = true;

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ estudio: string }>;
}) {
  const { estudio: slug } = await params;

  const { data: estudio } = await supabase
    .from('estudios')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!estudio) {
    notFound();
  }

  const [{ data: servicios }, { data: combos }] = await Promise.all([
    supabase
      .from('servicios')
      .select('*')
      .eq('estudio_id', estudio.id)
      .eq('activo', true)
      .order('orden'),
    supabase
      .from('combos')
      .select('*, combo_servicios(servicio_id)')
      .eq('estudio_id', estudio.id)
      .eq('activo', true),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {estudio.nombre}
          </h1>
          <p className="text-gray-600 mt-2">Reservá tu turno</p>
        </div>

        <ReservaForm
          estudioId={estudio.id}
          servicios={servicios || []}
          combos={combos || []}
        />
      </div>
    </main>
  );
}