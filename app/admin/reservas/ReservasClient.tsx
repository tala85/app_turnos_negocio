"use client";

import Link from "next/link";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalDetalles from "./ModalDetalles";

export type Reserva = {
  id: string;
  estudio_id: string;
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_dni: string;
  cliente_telefono: string;
  estado: string;
  total: number;
  sena: number;
  mp_preference_id?: string;
  mp_payment_id?: string;
  servicio_ids?: string[];
  combo_ids?: string[];
  turno_ids?: string[];
  created_at: string;
  updated_at?: string;
};

export type Servicio = {
  id: string;
  nombre: string;
  precio: number;
  duracion_min: number;
  descripcion?: string;
};
export type Combo = {
  id: string;
  nombre: string;
  precio_oferta: number;
  descripcion?: string;
};
export type Turno = { id: string; inicio: string; fin: string; estado: string };
export type Estudio = { nombre: string; direccion: string; telefono: string };
export type ReservaDetalles = Reserva & {
  servicios: Servicio[];
  combos: Combo[];
  turnos: Turno[];
  estudio: Estudio | null;
};

const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });

export default function ReservasClient({ reservas }: { reservas: Reserva[] }) {
  const router = useRouter();
  const [detalles, setDetalles] = useState<ReservaDetalles | null>(null);

  const bloqueadas = reservas.filter((r) => r.estado === "bloqueada");
  const pagadas = reservas.filter((r) => r.estado === "pagada");
  const confirmadas = reservas.filter((r) => r.estado === "confirmada");
  const canceladas = reservas.filter((r) => r.estado === "cancelada");

  const cambiarEstado = async (id: string, estado: string) => {
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      const data = await res.json();
      if (data.ok) window.location.reload();
      else alert(data.mensaje || "Error al actualizar");
    } catch {
      alert("Error de conexión");
    }
  };

  const verDetalles = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reservas/${id}`);
      const data = await res.json();
      if (data.ok) setDetalles(data.reserva);
      else alert(data.mensaje || "Error al cargar detalles");
    } catch {
      alert("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Panel de Administración
            </h1>
            <p className="text-gray-600 mt-1">Gestión de reservas</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                document.cookie = "admin_auth=; path=/; max-age=0";
                 router.push("/admin/login");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
            >
              Cerrar sesión
            </button>
            <Link
              href="/"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-700 font-medium">Bloqueadas</p>
            <p className="text-3xl font-bold text-amber-900">
              {bloqueadas.length}
            </p>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700 font-medium">Pagadas</p>
            <p className="text-3xl font-bold text-blue-900">{pagadas.length}</p>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-700 font-medium">Confirmadas</p>
            <p className="text-3xl font-bold text-green-900">
              {confirmadas.length}
            </p>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium">Canceladas</p>
            <p className="text-3xl font-bold text-red-900">
              {canceladas.length}
            </p>
          </div>
        </div>

        {detalles && (
          <ModalDetalles
            detalles={detalles}
            onClose={() => setDetalles(null)}
            onCambiarEstado={cambiarEstado}
          />
        )}

        <div className="space-y-6">
          {bloqueadas.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-amber-700 mb-3">
                ⏳ Pendientes de pago ({bloqueadas.length})
              </h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">
                        Seña
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bloqueadas.map((r) => (
                      <tr key={r.id} className="hover:bg-amber-50/50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatearFecha(r.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="font-medium">
                            {r.cliente_nombre} {r.cliente_apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            DNI: {r.cliente_dni} | Tel: {r.cliente_telefono}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          ${r.total.toLocaleString("es-AR")}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-amber-600">
                          ${r.sena.toLocaleString("es-AR")}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => verDetalles(r.id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                            >
                              Ver detalles
                            </button>
                            <button
                              onClick={() =>
                                confirm("¿Confirmar?") &&
                                cambiarEstado(r.id, "confirmada")
                              }
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() =>
                                confirm("¿Cancelar?") &&
                                cambiarEstado(r.id, "cancelada")
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {pagadas.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                💳 Pagadas ({pagadas.length})
              </h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pagadas.map((r) => (
                      <tr key={r.id} className="hover:bg-blue-50/50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatearFecha(r.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="font-medium">
                            {r.cliente_nombre} {r.cliente_apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            DNI: {r.cliente_dni}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          ${r.total.toLocaleString("es-AR")}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => verDetalles(r.id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                            >
                              Ver detalles
                            </button>
                            <button
                              onClick={() =>
                                confirm("¿Confirmar?") &&
                                cambiarEstado(r.id, "confirmada")
                              }
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Confirmar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {confirmadas.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-green-700 mb-3">
                ✅ Confirmadas ({confirmadas.length})
              </h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {confirmadas.map((r) => (
                      <tr key={r.id} className="hover:bg-green-50/50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatearFecha(r.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="font-medium">
                            {r.cliente_nombre} {r.cliente_apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            DNI: {r.cliente_dni}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          ${r.total.toLocaleString("es-AR")}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => verDetalles(r.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {canceladas.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-3">
                ❌ Canceladas ({canceladas.length})
              </h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {canceladas.map((r) => (
                      <tr key={r.id} className="hover:bg-red-50/50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatearFecha(r.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="font-medium">
                            {r.cliente_nombre} {r.cliente_apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            DNI: {r.cliente_dni}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          ${r.total.toLocaleString("es-AR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {reservas.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <p className="text-gray-500 text-lg">No hay reservas todavía</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
