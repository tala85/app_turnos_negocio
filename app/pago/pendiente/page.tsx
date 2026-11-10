import Link from 'next/link';

export default function PagoPendientePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 shadow-md text-center max-w-md">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Pago pendiente
        </h1>
        <p className="text-gray-600 mb-4">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>
        <Link
          href="/"
          className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}