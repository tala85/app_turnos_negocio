import Link from 'next/link';

export default function PagoFalloPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 shadow-md text-center max-w-md">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Pago fallido
        </h1>
        <p className="text-gray-600 mb-4">
          Hubo un problema con el pago. Tu turno fue liberado.
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