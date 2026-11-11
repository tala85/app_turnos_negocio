"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ModalDetalles from "./ModalDetalles";
import { useModoOscuro } from "@/hooks/useModoOscuro";

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

type Estadisticas = {
  totalReservas: number;
  reservasHoy: number;
  confirmadasHoy: number;
  ingresosHoy: number;
  tasaConfirmacion: number;
  porDia: Record<string, number>;
  turnosHoy: Reserva[];
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

const formatearHora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });

const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";

export default function ReservasClient({ reservas }: { reservas: Reserva[] }) {
  const router = useRouter();
  const [detalles, setDetalles] = useState<ReservaDetalles | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [colorPrimario, setColorPrimario] = useState("#ec4899");

  // 🌙 ESTADO DEL MODO OSCURO (con persistencia en localStorage)
  const { modoOscuro, setModoOscuro } = useModoOscuro();

  const bloqueadas = reservas.filter((r) => r.estado === "bloqueada");
  const pagadas = reservas.filter((r) => r.estado === "pagada");
  const confirmadas = reservas.filter((r) => r.estado === "confirmada");
  const canceladas = reservas.filter((r) => r.estado === "cancelada");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resEst = await fetch(
          `/api/admin/estadisticas?estudioId=${ESTUDIO_ID}`,
        );
        const dataEst = await resEst.json();
        if (dataEst.ok) setEstadisticas(dataEst.data);

        const resConfig = await fetch(
          `/api/admin/configuracion?estudioId=${ESTUDIO_ID}`,
        );
        const dataConfig = await resConfig.json();
        if (dataConfig.ok && dataConfig.data.color_primario) {
          setColorPrimario(dataConfig.data.color_primario);
        }
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      }
    };
    cargarDatos();
  }, []);

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

  const maxReservasDia = estadisticas
    ? Math.max(...Object.values(estadisticas.porDia), 1)
    : 1;

  // 🎨 Clases dinámicas según el modo
  const bgPrincipal = modoOscuro ? "bg-gray-900" : "bg-gray-100";
  const bgTarjeta = modoOscuro ? "bg-gray-800" : "bg-white";
  const textoPrincipal = modoOscuro ? "text-gray-100" : "text-gray-800";
  const textoSecundario = modoOscuro ? "text-gray-400" : "text-gray-600";
  const bordeTarjeta = modoOscuro ? "border-gray-700" : "border-gray-100";
  const bgFilaHover = modoOscuro ? "hover:bg-gray-700/50" : "hover:bg-gray-50";
  const textoTabla = modoOscuro ? "text-gray-300" : "text-gray-700";
  const bgHeaderTabla = modoOscuro ? "bg-gray-700/50" : "bg-gray-50";
  const bordeDivisor = modoOscuro ? "divide-gray-700" : "divide-gray-100";

  return (
    <div
      className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${textoPrincipal}`}>
              Panel de Administración
            </h1>
            <p className={`${textoSecundario} mt-1`}>Gestión de reservas</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {/* 🌙 SWITCH MODO OSCURO */}
            <button
              onClick={() => setModoOscuro(!modoOscuro)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                modoOscuro
                  ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
              title={
                modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
            >
              <span className="text-lg">{modoOscuro ? "☀️" : "🌙"}</span>
              <span className="text-sm font-medium">
                {modoOscuro ? "Claro" : "Oscuro"}
              </span>
            </button>

            <Link
              href="/admin/configuracion"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              🎨 Personalización
            </Link>
            <Link
              href="/admin/servicios"
              className="bg-white border-2 border-blue-500 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              💅 Gestión de Servicios
            </Link>
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

        {/* ESTADÍSTICAS DEL DÍA */}
        {estadisticas && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📊 Resumen de hoy
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-sm opacity-90">Reservas hoy</p>
                <p className="text-3xl font-bold">{estadisticas.reservasHoy}</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-sm opacity-90">Ingresos estimados</p>
                <p className="text-3xl font-bold">
                  ${estadisticas.ingresosHoy.toLocaleString("es-AR")}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-sm opacity-90">Confirmadas</p>
                <p className="text-3xl font-bold">
                  {estadisticas.confirmadasHoy}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-sm opacity-90">Tasa de confirmación</p>
                <p className="text-3xl font-bold">
                  {estadisticas.tasaConfirmacion}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PRÓXIMOS TURNOS */}
        {estadisticas && estadisticas.turnosHoy.length > 0 && (
          <div
            className={`${bgTarjeta} rounded-xl shadow-md p-6 mb-8 border ${bordeTarjeta}`}
          >
            <h2
              className={`text-xl font-bold ${textoPrincipal} mb-4 flex items-center gap-2`}
            >
              ⏰ Próximos turnos de hoy
            </h2>
            <div className="space-y-2">
              {estadisticas.turnosHoy.map((turno) => (
                <div
                  key={turno.id}
                  className={`flex items-center justify-between p-3 ${modoOscuro ? "bg-gray-700/50" : "bg-gray-50"} rounded-lg ${bgFilaHover} transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {formatearHora(turno.created_at)}
                    </div>
                    <div>
                      <p className={`font-medium ${textoPrincipal}`}>
                        {turno.cliente_nombre} {turno.cliente_apellido}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tel: {turno.cliente_telefono}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${colorPrimario}20`,
                        color: colorPrimario,
                      }}
                    >
                      {turno.estado}
                    </span>
                    <button
                      onClick={() => verDetalles(turno.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GRÁFICO SEMANAL */}
        {estadisticas && Object.keys(estadisticas.porDia).length > 0 && (
          <div
            className={`${bgTarjeta} rounded-xl shadow-md p-6 mb-8 border ${bordeTarjeta}`}
          >
            <h2
              className={`text-xl font-bold ${textoPrincipal} mb-4 flex items-center gap-2`}
            >
              📈 Actividad últimos 7 días
            </h2>
            <div className="flex items-end gap-2 h-40">
              {Object.entries(estadisticas.porDia).map(([dia, cantidad]) => {
                const altura = (cantidad / maxReservasDia) * 100;
                return (
                  <div
                    key={dia}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span
                      className={`text-xs font-semibold ${modoOscuro ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {cantidad}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all"
                      style={{ height: `${altura}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 capitalize">
                      {dia}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TARJETAS DE ESTADO */}
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

        {/* LISTA DE RESERVAS */}
        <div className="space-y-6">
          {bloqueadas.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-amber-700 mb-3">
                ⏳ Pendientes de pago ({bloqueadas.length})
              </h2>

              {/* 🖥️ TABLA (solo en desktop) */}
              <div
                className={`${bgTarjeta} rounded-xl shadow-md overflow-hidden border ${bordeTarjeta} hidden md:block`}
              >
                <table className="w-full">
                  <thead className={bgHeaderTabla}>
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
                  <tbody className={`divide-y ${bordeDivisor}`}>
                    {bloqueadas.map((r) => (
                      <tr key={r.id} className={bgFilaHover}>
                        <td className={`px-4 py-3 text-sm ${textoTabla}`}>
                          {formatearFecha(r.created_at)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${textoTabla}`}>
                          <div className="font-medium">
                            {r.cliente_nombre} {r.cliente_apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            DNI: {r.cliente_dni} | Tel: {r.cliente_telefono}
                          </div>
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-semibold ${modoOscuro ? "text-gray-100" : "text-gray-800"}`}
                        >
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

              {/* 📱 CARDS (solo en mobile) */}
              <div className="md:hidden space-y-3">
                {bloqueadas.map((r) => (
                  <div
                    key={r.id}
                    className={`${bgTarjeta} rounded-xl shadow-md p-4 border ${bordeTarjeta}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className={`font-bold ${textoPrincipal}`}>
                          {r.cliente_nombre} {r.cliente_apellido}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tel: {r.cliente_telefono}
                        </p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                        Pendiente
                      </span>
                    </div>

                    <div className="space-y-1 mb-3 text-sm">
                      <p className={textoSecundario}>
                        📅{" "}
                        <span className="font-medium">
                          {formatearFecha(r.created_at)}
                        </span>
                      </p>
                      <p className={textoSecundario}>
                        💰 Total:{" "}
                        <span
                          className={`font-semibold ${modoOscuro ? "text-gray-100" : "text-gray-800"}`}
                        >
                          ${r.total.toLocaleString("es-AR")}
                        </span>
                      </p>
                      <p className="text-amber-600 font-semibold">
                        💵 Seña: ${r.sena.toLocaleString("es-AR")}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => verDetalles(r.id)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
                      >
                        Ver detalles
                      </button>
                      <button
                        onClick={() =>
                          confirm("¿Confirmar?") &&
                          cambiarEstado(r.id, "confirmada")
                        }
                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() =>
                          confirm("¿Cancelar?") &&
                          cambiarEstado(r.id, "cancelada")
                        }
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pagadas.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">
                💳 Pagadas ({pagadas.length})
              </h2>

              {/* 🖥️ TABLA (solo en desktop) */}
              <div
                className={`${bgTarjeta} rounded-xl shadow-md overflow-hidden border ${bordeTarjeta} hidden md:block`}
              >
                <table className="w-full">
                  <thead className={bgHeaderTabla}>
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
                  <tbody className={`divide-y ${bordeDivisor}`}>
                    {pagadas.map((r) => (
                      <tr key={r.id} className={bgFilaHover}>
                        <td className={`px-4 py-3 text-sm ${textoTabla}`}>
                          {formatearFecha(r.created_at)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${textoTabla}`}>
                          <div className="font-medium">
                            {r.cliente_nombre} {r.cliente_apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            DNI: {r.cliente_dni}
                          </div>
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-semibold ${modoOscuro ? "text-gray-100" : "text-gray-800"}`}
                        >
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

              {/* 📱 CARDS (solo en mobile) */}
              <div className="md:hidden space-y-3">
                {pagadas.map((r) => (
                  <div
                    key={r.id}
                    className={`${bgTarjeta} rounded-xl shadow-md p-4 border ${bordeTarjeta}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className={`font-bold ${textoPrincipal}`}>
                          {r.cliente_nombre} {r.cliente_apellido}
                        </p>
                        <p className="text-xs text-gray-500">
                          DNI: {r.cliente_dni}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Pagada
                      </span>
                    </div>

                    <div className="space-y-1 mb-3 text-sm">
                      <p className={textoSecundario}>
                        📅{" "}
                        <span className="font-medium">
                          {formatearFecha(r.created_at)}
                        </span>
                      </p>
                      <p className={textoSecundario}>
                        💰 Total:{" "}
                        <span
                          className={`font-semibold ${modoOscuro ? "text-gray-100" : "text-gray-800"}`}
                        >
                          ${r.total.toLocaleString("es-AR")}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => verDetalles(r.id)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
                      >
                        Ver detalles
                      </button>
                      <button
                        onClick={() =>
                          confirm("¿Confirmar?") &&
                          cambiarEstado(r.id, "confirmada")
                        }
                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {confirmadas.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-green-700 mb-3">
                ✅ Confirmadas ({confirmadas.length})
              </h2>

              {/* 🖥️ TABLA (solo en desktop) */}
              <div
                className={`${bgTarjeta} rounded-xl shadow-md overflow-hidden border ${bordeTarjeta} hidden md:block`}
              >
                <table className="w-full">
                  <thead className={bgHeaderTabla}>
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
                  <tbody className={`divide-y ${bordeDivisor}`}>
                    {confirmadas.map((r) => (
                      <tr key={r.id} className={bgFilaHover}>
                        <td className={`px-4 py-3 text-sm ${textoTabla}`}>
                          {formatearFecha(r.created_at)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${textoTabla}`}>
                          <div className="font-medium">
                            {r.cliente_nombre} {r.cliente_apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            DNI: {r.cliente_dni}
                          </div>
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-semibold ${modoOscuro ? "text-gray-100" : "text-gray-800"}`}
                        >
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

              {/* 📱 CARDS (solo en mobile) */}
              <div className="md:hidden space-y-3">
                {confirmadas.map((r) => (
                  <div
                    key={r.id}
                    className={`${bgTarjeta} rounded-xl shadow-md p-4 border ${bordeTarjeta}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className={`font-bold ${textoPrincipal}`}>
                          {r.cliente_nombre} {r.cliente_apellido}
                        </p>
                        <p className="text-xs text-gray-500">
                          DNI: {r.cliente_dni}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Confirmada
                      </span>
                    </div>

                    <div className="space-y-1 mb-3 text-sm">
                      <p className={textoSecundario}>
                        📅{" "}
                        <span className="font-medium">
                          {formatearFecha(r.created_at)}
                        </span>
                      </p>
                      <p className={textoSecundario}>
                        💰 Total:{" "}
                        <span
                          className={`font-semibold ${modoOscuro ? "text-gray-100" : "text-gray-800"}`}
                        >
                          ${r.total.toLocaleString("es-AR")}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => verDetalles(r.id)}
                      className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
                    >
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
          {canceladas.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-3">
                ❌ Canceladas ({canceladas.length})
              </h2>

              {/* 🖥️ TABLA (solo en desktop) */}
              <div
                className={`${bgTarjeta} rounded-xl shadow-md overflow-hidden border ${bordeTarjeta} hidden md:block`}
              >
                <table className="w-full">
                  <thead className={bgHeaderTabla}>
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
                  <tbody className={`divide-y ${bordeDivisor}`}>
                    {canceladas.map((r) => (
                      <tr key={r.id} className={bgFilaHover}>
                        <td className={`px-4 py-3 text-sm ${textoTabla}`}>
                          {formatearFecha(r.created_at)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${textoTabla}`}>
                          <div className="font-medium">
                            {r.cliente_nombre} {r.cliente_apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            DNI: {r.cliente_dni}
                          </div>
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-semibold ${modoOscuro ? "text-gray-100" : "text-gray-800"}`}
                        >
                          ${r.total.toLocaleString("es-AR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 📱 CARDS (solo en mobile) */}
              <div className="md:hidden space-y-3">
                {canceladas.map((r) => (
                  <div
                    key={r.id}
                    className={`${bgTarjeta} rounded-xl shadow-md p-4 border ${bordeTarjeta} opacity-75`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className={`font-bold ${textoPrincipal}`}>
                          {r.cliente_nombre} {r.cliente_apellido}
                        </p>
                        <p className="text-xs text-gray-500">
                          DNI: {r.cliente_dni}
                        </p>
                      </div>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        Cancelada
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className={textoSecundario}>
                        📅{" "}
                        <span className="font-medium">
                          {formatearFecha(r.created_at)}
                        </span>
                      </p>
                      <p className={textoSecundario}>
                        💰 Total:{" "}
                        <span
                          className={`font-semibold ${modoOscuro ? "text-gray-100" : "text-gray-800"}`}
                        >
                          ${r.total.toLocaleString("es-AR")}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {reservas.length === 0 && (
            <div
              className={`${bgTarjeta} rounded-xl p-8 text-center shadow-md border ${bordeTarjeta}`}
            >
              <p className={`${textoSecundario} text-lg`}>
                No hay reservas todavía
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
