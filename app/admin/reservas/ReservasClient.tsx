"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ModalDetalles from "./ModalDetalles";
import { useTema, type Tema } from "@/lib/admin/tema";

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

const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";

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

// --- COMPONENTE REUTILIZABLE (ahora usa el Tema real) ---
type SeccionReservasProps = {
  titulo: string;
  color: "amber" | "blue" | "green" | "red";
  reservas: Reserva[];
  tema: Tema;
  verDetalles: (id: string) => void;
  cambiarEstado: (id: string, estado: string) => void;
  mostrarConfirmar: boolean;
  mostrarCancelar: boolean;
};

function SeccionReservas({
  titulo,
  color,
  reservas,
  tema,
  verDetalles,
  cambiarEstado,
  mostrarConfirmar,
  mostrarCancelar,
}: SeccionReservasProps) {
  if (reservas.length === 0) return null;

  const colores = {
    amber: { text: "text-amber-600", textDark: "text-amber-700", badge: "bg-amber-500/15 text-amber-600" },
    blue: { text: "text-blue-600", textDark: "text-blue-700", badge: "bg-blue-500/15 text-blue-600" },
    green: { text: "text-emerald-600", textDark: "text-emerald-700", badge: "bg-emerald-500/15 text-emerald-600" },
    red: { text: "text-red-600", textDark: "text-red-700", badge: "bg-red-500/15 text-red-600" },
  };

  const c = colores[color];

  return (
    <section>
      <h2 className={`text-lg font-semibold tracking-tight ${c.text} mb-3`}>
        {titulo} ({reservas.length})
      </h2>

      {/* Desktop: Tabla */}
      <div className={`${tema.tarjeta} rounded-xl border ${tema.borde} overflow-hidden shadow-sm hidden md:block`}>
        <table className="w-full">
          <thead className={tema.suave}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${tema.texto2}`}>Fecha</th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${tema.texto2}`}>Cliente</th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${tema.texto2}`}>Total</th>
              {color === "amber" && (
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${tema.texto2}`}>Seña</th>
              )}
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${tema.texto2}`}>Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${tema.divisor}`}>
            {reservas.map((r) => (
              <tr key={r.id} className={tema.filaHover}>
                <td className={`px-4 py-3 text-sm ${tema.texto2}`}>{formatearFecha(r.created_at)}</td>
                <td className={`px-4 py-3 text-sm ${tema.texto}`}>
                  <div className="font-medium">{r.cliente_nombre} {r.cliente_apellido}</div>
                  <div className={`text-xs ${tema.texto2}`}>
                    DNI: {r.cliente_dni} {r.cliente_telefono && `| Tel: ${r.cliente_telefono}`}
                  </div>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${tema.texto}`}>
                  ${r.total.toLocaleString("es-AR")}
                </td>
                {color === "amber" && (
                  <td className="px-4 py-3 text-sm font-semibold text-amber-600">
                    ${r.sena.toLocaleString("es-AR")}
                  </td>
                )}
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => verDetalles(r.id)}
                      className="bg-blue-500/15 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/25 transition-colors"
                    >
                      Ver
                    </button>
                    {mostrarConfirmar && (
                      <button
                        onClick={() => confirm("¿Confirmar?") && cambiarEstado(r.id, "confirmada")}
                        className="bg-emerald-500/15 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition-colors"
                      >
                        Confirmar
                      </button>
                    )}
                    {mostrarCancelar && (
                      <button
                        onClick={() => confirm("¿Cancelar?") && cambiarEstado(r.id, "cancelada")}
                        className="bg-red-500/15 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/25 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {reservas.map((r) => (
          <div key={r.id} className={`${tema.tarjeta} rounded-xl p-4 border ${tema.borde} shadow-sm`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className={`font-semibold ${tema.texto}`}>{r.cliente_nombre} {r.cliente_apellido}</p>
                <p className={`text-xs ${tema.texto2}`}>DNI: {r.cliente_dni}</p>
              </div>
              <span className={`${c.badge} px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                {titulo.split(" ")[0]}
              </span>
            </div>
            <div className="space-y-1 mb-3 text-sm">
              <p className={tema.texto2}>📅 <span className={`font-medium ${tema.texto}`}>{formatearFecha(r.created_at)}</span></p>
              <p className={tema.texto2}>💰 Total: <span className={`font-semibold ${tema.texto}`}>${r.total.toLocaleString("es-AR")}</span></p>
              {color === "amber" && <p className="text-amber-600 font-semibold">💵 Seña: ${r.sena.toLocaleString("es-AR")}</p>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => verDetalles(r.id)}
                className="flex-1 bg-blue-500/15 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-500/25 transition-colors"
              >
                Ver detalles
              </button>
              {mostrarConfirmar && (
                <button
                  onClick={() => confirm("¿Confirmar?") && cambiarEstado(r.id, "confirmada")}
                  className="flex-1 bg-emerald-500/15 text-emerald-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-500/25 transition-colors"
                >
                  Confirmar
                </button>
              )}
              {mostrarCancelar && (
                <button
                  onClick={() => confirm("¿Cancelar?") && cambiarEstado(r.id, "cancelada")}
                  className="flex-1 bg-red-500/15 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-500/25 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function ReservasClient({ reservas }: { reservas: Reserva[] }) {
  const router = useRouter();
  const tema = useTema(); // ✅ UNA sola fuente de verdad

  const [detalles, setDetalles] = useState<ReservaDetalles | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);

  const bloqueadas = reservas.filter((r) => r.estado === "bloqueada");
  const pagadas = reservas.filter((r) => r.estado === "pagada");
  const confirmadas = reservas.filter((r) => r.estado === "confirmada");
  const canceladas = reservas.filter((r) => r.estado === "cancelada");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resEst = await fetch(`/api/admin/estadisticas?estudioId=${ESTUDIO_ID}`);
        const dataEst = await resEst.json();
        if (dataEst.ok) setEstadisticas(dataEst.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
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
      else alert(data.mensaje || "Error");
    } catch {
      alert("Error de conexión");
    }
  };

  const verDetalles = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reservas/${id}`);
      const data = await res.json();
      if (data.ok) setDetalles(data.reserva);
      else alert(data.mensaje || "Error");
    } catch {
      alert("Error de conexión");
    }
  };

  const maxReservasDia = estadisticas
    ? Math.max(...Object.values(estadisticas.porDia), 1)
    : 1;

  return (
    <div className={`min-h-screen ${tema.bg} ${tema.texto} transition-colors duration-300`}>
      <div className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        {/* ✅ Header unificado con las demás páginas */}
        <AdminHeader
          tema={tema}
          icono="📋"
          titulo="Panel de Administración"
          subtitulo="Gestión de reservas y turnos"
          links={[
            { href: "/admin/horarios", label: "Horarios", icono: "🕒", color: "blue" },
            { href: "/admin/servicios", label: "Servicios", icono: "💅", color: "pink" },
            { href: "/admin/combos", label: "Combos", icono: "🎁", color: "purple" },
            { href: "/admin/configuracion", label: "Personalización", icono: "🎨", color: "fuchsia" },
          ]}
        />

        {/* Botón de cerrar sesión discreto */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              document.cookie = "admin_auth=; path=/; max-age=0";
              router.push("/admin/login");
            }}
            className={`h-9 px-4 text-xs font-medium ${tema.btnNeutro}`}
          >
            🚪 Cerrar sesión
          </button>
        </div>

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-sm p-5 sm:p-6 mb-6 text-white">
            <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
              📊 Resumen de hoy
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/15 backdrop-blur rounded-xl p-4">
                <p className="text-xs opacity-80">Reservas hoy</p>
                <p className="text-2xl md:text-3xl font-bold">{estadisticas.reservasHoy}</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-4">
                <p className="text-xs opacity-80">Ingresos</p>
                <p className="text-2xl md:text-3xl font-bold">${estadisticas.ingresosHoy.toLocaleString("es-AR")}</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-4">
                <p className="text-xs opacity-80">Confirmadas</p>
                <p className="text-2xl md:text-3xl font-bold">{estadisticas.confirmadasHoy}</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-4">
                <p className="text-xs opacity-80">Tasa</p>
                <p className="text-2xl md:text-3xl font-bold">{estadisticas.tasaConfirmacion}%</p>
              </div>
            </div>
          </div>
        )}

        {/* PRÓXIMOS TURNOS */}
        {estadisticas && estadisticas.turnosHoy && estadisticas.turnosHoy.length > 0 && (
          <div className={`${tema.tarjeta} rounded-2xl border ${tema.borde} shadow-sm p-5 sm:p-6 mb-6`}>
            <h2 className={`text-lg font-semibold tracking-tight ${tema.texto} mb-4`}>⏰ Próximos turnos de hoy</h2>
            <div className="space-y-2">
              {estadisticas.turnosHoy.map((turno) => (
                <div key={turno.id} className={`flex items-center justify-between p-3 ${tema.suave} rounded-xl ${tema.filaHover} transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/15 text-indigo-500 px-3 py-1 rounded-full text-sm font-semibold">
                      {formatearHora(turno.created_at)}
                    </div>
                    <div>
                      <p className={`font-medium ${tema.texto}`}>{turno.cliente_nombre} {turno.cliente_apellido}</p>
                      <p className={`text-xs ${tema.texto2}`}>Tel: {turno.cliente_telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tema.badge(true)}`}>{turno.estado}</span>
                    <button
                      onClick={() => verDetalles(turno.id)}
                      className="bg-blue-500/15 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/25 transition-colors"
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
          <div className={`${tema.tarjeta} rounded-2xl border ${tema.borde} shadow-sm p-5 sm:p-6 mb-6`}>
            <h2 className={`text-lg font-semibold tracking-tight ${tema.texto} mb-4`}>📈 Actividad últimos 7 días</h2>
            <div className="flex items-end gap-2 h-40">
              {Object.entries(estadisticas.porDia).map(([dia, cantidad]) => (
                <div key={dia} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-xs font-semibold ${tema.texto2}`}>{cantidad}</span>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all"
                    style={{ height: `${(cantidad / maxReservasDia) * 100}%` }}
                  ></div>
                  <span className={`text-xs ${tema.texto2} capitalize`}>{dia}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIONES DE RESERVAS */}
        <div className="space-y-6">
          <SeccionReservas titulo="⏳ Pendientes de pago" color="amber" reservas={bloqueadas} tema={tema} verDetalles={verDetalles} cambiarEstado={cambiarEstado} mostrarConfirmar mostrarCancelar />
          <SeccionReservas titulo="💳 Pagadas" color="blue" reservas={pagadas} tema={tema} verDetalles={verDetalles} cambiarEstado={cambiarEstado} mostrarConfirmar mostrarCancelar={false} />
          <SeccionReservas titulo="✅ Confirmadas" color="green" reservas={confirmadas} tema={tema} verDetalles={verDetalles} cambiarEstado={cambiarEstado} mostrarConfirmar={false} mostrarCancelar={false} />
          <SeccionReservas titulo="❌ Canceladas" color="red" reservas={canceladas} tema={tema} verDetalles={verDetalles} cambiarEstado={cambiarEstado} mostrarConfirmar={false} mostrarCancelar={false} />

          {reservas.length === 0 && (
            <div className={`${tema.tarjeta} rounded-2xl p-8 text-center border ${tema.borde} shadow-sm`}>
              <p className={`${tema.texto2} text-lg`}>No hay reservas todavía</p>
            </div>
          )}
        </div>
      </div>

      {detalles && (
        <ModalDetalles detalles={detalles} onClose={() => setDetalles(null)} onCambiarEstado={cambiarEstado} />
      )}
    </div>
  );
}