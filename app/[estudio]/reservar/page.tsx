import { adminDb } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import ReservaForm from '@/components/ReservaForm';

// ❌ BORRAR O COMENTAR ESTA FUNCIÓN:
//export async function generateStaticParams() {
// const { data: estudios } = await adminDb
//    .from('estudios')
//    .select('slug');

//  return estudios?.map((e) => ({ estudio: e.slug })) ?? [];
//}

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ estudio: string }>;
}) {
  const { estudio: slug } = await params;

  const { data: estudio } = await adminDb
    .from('estudios')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!estudio) {
    notFound();
  }

  const [{ data: servicios }, { data: combos }] = await Promise.all([
    adminDb
      .from('servicios')
      .select('*')
      .eq('estudio_id', estudio.id)
      .eq('activo', true)
      .order('orden'),
    adminDb
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
// Al final del archivo, agregá un comentario
// Fix: ensure this page is included in build