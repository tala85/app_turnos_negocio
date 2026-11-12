import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Número gigante con gradiente */}
        <p className="text-[8rem] md:text-[10rem] font-extrabold leading-none bg-gradient-to-br from-pink-500 to-fuchsia-600 bg-clip-text text-transparent select-none">
          404
        </p>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Página no encontrada
          </h1>
          <p className="text-gray-600">
            La página que buscás no existe o cambió de lugar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-medium shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            ← Volver al inicio
          </Link>
          <Link
            href="/belleza-posadas/reservar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-gray-200 text-gray-700 font-medium hover:border-pink-300 hover:text-pink-600 transition-all"
          >
            ✨ Reservar turno
          </Link>
        </div>
      </div>
    </div>
  );
}