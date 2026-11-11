"use client";

import { useState } from "react"; // ✅ Sacar useEffect del import
import Link from "next/link";

type DatosReserva = {
  clienteNombre: string;
  clienteApellido: string;
  servicios: string[];
  total: number;
  sena: number;
  fecha: string;
  hora: string;
  telefonoEstudio: string;
};

function getDatosIniciales(): DatosReserva | null {
  if (typeof window === "undefined") return null;

  const datosGuardados = sessionStorage.getItem("reservaExitosa");
  if (datosGuardados) {
    const datos = JSON.parse(datosGuardados);
    sessionStorage.removeItem("reservaExitosa");
    return datos;
  }
  return null;
}

export default function ExitoPage() {
  const datos = useState<DatosReserva | null>(getDatosIniciales())[0]; // ✅ Solo usamos el primer valor

  const generarMensajeWhatsApp = () => {
    if (!datos) return "";

    const mensaje =
      `¡Hola! Soy ${datos.clienteNombre} ${datos.clienteApellido}.%0A%0A` +
      `Acabo de reservar un turno:%0A` +
      `📅 Fecha: ${datos.fecha}%0A` +
      `⏰ Hora: ${datos.hora}%0A` +
      `💅 Servicios: ${datos.servicios.join(", ")}%0A` +
      `💰 Total: $${datos.total.toLocaleString("es-AR")}%0A` +
      `✅ Seña pagada: $${datos.sena.toLocaleString("es-AR")}%0A%0A` +
      `¡Gracias!`;

    return mensaje;
  };

  if (!datos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Pago exitoso
          </h1>
          <p className="text-gray-600 mb-6">
            Tu reserva fue confirmada correctamente.
          </p>
          <Link
            href="/"
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Reserva confirmada!
          </h1>
          <p className="text-gray-600">Tu pago fue procesado exitosamente</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">
            Resumen de tu reserva:
          </h3>
          <p className="text-sm text-gray-600">
            <strong>Cliente:</strong> {datos.clienteNombre}{" "}
            {datos.clienteApellido}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Fecha:</strong> {datos.fecha}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Hora:</strong> {datos.hora}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Servicios:</strong> {datos.servicios.join(", ")}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Total:</strong> ${datos.total.toLocaleString("es-AR")}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Seña pagada:</strong> ${datos.sena.toLocaleString("es-AR")}
          </p>
        </div>

        <a
          href={`https://wa.me/54${datos.telefonoEstudio.replace(/\D/g, "")}?text=${generarMensajeWhatsApp()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-green-500 text-white text-center py-3 rounded-lg hover:bg-green-600 font-semibold mb-4"
        >
          Enviar confirmación por WhatsApp
        </a>

        <Link
          href="/"
          className="block w-full bg-gray-200 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-300"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
