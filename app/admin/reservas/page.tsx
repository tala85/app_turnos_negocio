import { adminDb } from '@/lib/supabase/admin';
import ReservasClient from './ReservasClient';

export default async function AdminReservasPage() {
  const { data: reservas, error } = await adminDb
    .from('reservas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Error al cargar reservas
          </h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return <ReservasClient reservas={reservas || []} />;
}