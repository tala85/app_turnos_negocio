"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModoOscuro } from "@/hooks/useModoOscuro";
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

type Estadisticas = {
  totalReservas: number;
  reservasHoy: number;
  confirmadasHoy: number;
  ingresosHoy: number;
  tasaConfirmacion: number;
  porDia: Record<string, number>;
  turnosHoy: Reserva[];
};

type Tema = {
  oscuro: boolean;
  bgPrincipal: string;
  bgTarjeta: string;
  bordeTarjeta: string;
  textoPrincipal: string;
  textoSecundario: string;
  bgFilaHover: string;
  textoTabla: string;
  bgHeaderTabla: string;
  bordeDivisor: string;
};

const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";

const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });

const formatearHora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });

// --- COMPONENTE REUTILIZABLE ---
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
  titulo, color, reservas, tema, verDetalles, cambiarEstado, mostrarConfirmar, mostrarCancelar
}: SeccionReservasProps) {
  if (reservas.length === 0) return null;

  const colores = {
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", textDark: "text-amber-900", badge: "bg-amber-100 text-amber-800" },
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", textDark: "text-blue-900", badge: "bg-blue-100 text-blue-800" },
    green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", textDark: "text-green-900", badge: "bg-green-100 text-green-800" },
    red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", textDark: "text-red-900", badge: "bg-red-100 text-red-800" },
  };

  const c = colores[color];

  return (
    <section>
      <h2 className={`text-xl font-semibold ${c.text} mb-3`}>{titulo} ({reservas.length})</h2>
      
      {/* Desktop: Tabla */}
      <div className={`${tema.bgTarjeta} rounded-xl shadow-md overflow-hidden border ${tema.bordeTarjeta} hidden md:block`}>
        <table className="w-full">
          <thead className={tema.bgHeaderTabla}>
            <tr>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${c.textDark}`}>Fecha</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${c.textDark}`}>Cliente</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${c.textDark}`}>Total</th>
              {color === "amber" && <th className={`px-4 py-3 text-left text-sm font-semibold ${c.textDark}`}>Seña</th>}
              <th className={`px-4 py-3 text-left text-sm font-semibold ${c.textDark}`}>Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${tema.bordeDivisor}`}>
            {reservas.map((r) => (
              <tr key={r.id} className={tema.bgFilaHover}>
                <td className={`px-4 py-3 text-sm ${tema.textoTabla}`}>{formatearFecha(r.created_at)}</td>
                <td className={`px-4 py-3 text-sm ${tema.textoTabla}`}>
                  <div className="font-medium">{r.cliente_nombre} {r.cliente_apellido}</div>
                  <div className="text-xs text-gray-500">DNI: {r.cliente_dni} {r.cliente_telefono && `| Tel: ${r.cliente_telefono}`}</div>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${tema.oscuro ? "text-gray-100" : "text-gray-800"}`}>${r.total.toLocaleString("es-AR")}</td>
                {color === "amber" && <td className="px-4 py-3 text-sm font-semibold text-amber-600">${r.sena.toLocaleString("es-AR")}</td>}
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => verDetalles(r.id)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">Ver</button>
                    {mostrarConfirmar && <button onClick={() => confirm("¿Confirmar?") && cambiarEstado(r.id, "confirmada")} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Confirmar</button>}
                    {mostrarCancelar && <button onClick={() => confirm("¿Cancelar?") && cambiarEstado(r.id, "cancelada")} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Cancelar</button>}
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
          <div key={r.id} className={`${tema.bgTarjeta} rounded-xl shadow-md p-4 border ${tema.bordeTarjeta}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className={`font-bold ${tema.textoPrincipal}`}>{r.cliente_nombre} {r.cliente_apellido}</p>
                <p className="text-xs text-gray-500">DNI: {r.cliente_dni}</p>
              </div>
              <span className={`${c.badge} px-2 py-1 rounded-full text-xs font-medium`}>{titulo.split(" ")[0]}</span>
            </div>
            <div className="space-y-1 mb-3 text-sm">
              <p className={tema.textoSecundario}>📅 <span className="font-medium">{formatearFecha(r.created_at)}</span></p>
              <p className={tema.textoSecundario}>💰 Total: <span className={`font-semibold ${tema.oscuro ? "text-gray-100" : "text-gray-800"}`}>${r.total.toLocaleString("es-AR")}</span></p>
              {color === "amber" && <p className="text-amber-600 font-semibold">💵 Seña: ${r.sena.toLocaleString("es-AR")}</p>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => verDetalles(r.id)} className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">Ver detalles</button>
              {mostrarConfirmar && <button onClick={() => confirm("¿Confirmar?") && cambiarEstado(r.id, "confirmada")} className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600">Confirmar</button>}
              {mostrarCancelar && <button onClick={() => confirm("¿Cancelar?") && cambiarEstado(r.id, "cancelada")} className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600">Cancelar</button>}
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
  const { modoOscuro, setModoOscuro } = useModoOscuro();
  
  // ✅ CORREGIDO: Usamos el tipo completo ReservaDetalles
  const [detalles, setDetalles] = useState<ReservaDetalles | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);

  const bloqueadas = reservas.filter((r) => r.estado === "bloqueada");
  const pagadas = reservas.filter((r) => r.estado === "pagada");
  const confirmadas = reservas.filter((r) => r.estado === "confirmada");
  const canceladas = reservas.filter((r) => r.estado === "cancelada");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // ✅ CORREGIDO: Eliminamos resConfig ya que no usamos colorPrimario en esta versión
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
        body: JSON.stringify({ estado }) 
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

  const maxReservasDia = estadisticas ? Math.max(...Object.values(estadisticas.porDia), 1) : 1;
  
  const tema: Tema = {
    oscuro: modoOscuro,
    bgPrincipal: modoOscuro ? "bg-gray-900" : "bg-gray-100",
    bgTarjeta: modoOscuro ? "bg-gray-800" : "bg-white",
    bordeTarjeta: modoOscuro ? "border-gray-700" : "border-gray-100",
    textoPrincipal: modoOscuro ? "text-gray-100" : "text-gray-800",
    textoSecundario: modoOscuro ? "text-gray-400" : "text-gray-600",
    bgFilaHover: modoOscuro ? "hover:bg-gray-700/50" : "hover:bg-gray-50",
    textoTabla: modoOscuro ? "text-gray-300" : "text-gray-700",
    bgHeaderTabla: modoOscuro ? "bg-gray-700/50" : "bg-gray-50",
    bordeDivisor: modoOscuro ? "divide-gray-700" : "divide-gray-100",
  };

  return (
    <div className={`min-h-screen ${tema.bgPrincipal} p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${tema.textoPrincipal}`}>Panel de Administración</h1>
            <p className={`${tema.textoSecundario} mt-1`}>Gestión de reservas</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button onClick={() => setModoOscuro(!modoOscuro)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${modoOscuro ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400" : "bg-gray-800 text-white hover:bg-gray-700"}`}>
              <span>{modoOscuro ? "☀️" : "🌙"}</span>
              <span className="text-sm font-medium">{modoOscuro ? "Claro" : "Oscuro"}</span>
            </button>
            <Link href="/admin/combos" className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm">🎁 Combos</Link>
            <Link href="/admin/configuracion" className="bg-white border-2 border-fuchsia-500 text-fuchsia-600 px-4 py-2 rounded-lg hover:bg-fuchsia-50 transition-colors text-sm font-medium">🎨 Personalización</Link>
            <Link href="/admin/servicios" className="bg-white border-2 border-blue-500 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">💅 Servicios</Link>
            <button onClick={() => { document.cookie = "admin_auth=; path=/; max-age=0"; router.push("/admin/login"); }} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">Salir</button>
            <Link href="/" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">← Inicio</Link>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📊 Resumen de hoy</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4"><p className="text-sm opacity-90">Reservas hoy</p><p className="text-3xl font-bold">{estadisticas.reservasHoy}</p></div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4"><p className="text-sm opacity-90">Ingresos</p><p className="text-3xl font-bold">${estadisticas.ingresosHoy.toLocaleString("es-AR")}</p></div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4"><p className="text-sm opacity-90">Confirmadas</p><p className="text-3xl font-bold">{estadisticas.confirmadasHoy}</p></div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4"><p className="text-sm opacity-90">Tasa</p><p className="text-3xl font-bold">{estadisticas.tasaConfirmacion}%</p></div>
            </div>
          </div>
        )}

        {/* PRÓXIMOS TURNOS */}
        {estadisticas && estadisticas.turnosHoy && estadisticas.turnosHoy.length > 0 && (
          <div className={`${tema.bgTarjeta} rounded-xl shadow-md p-6 mb-8 border ${tema.bordeTarjeta}`}>
            <h2 className={`text-xl font-bold ${tema.textoPrincipal} mb-4`}>⏰ Próximos turnos de hoy</h2>
            <div className="space-y-2">
              {estadisticas.turnosHoy.map((turno) => (
                <div key={turno.id} className={`flex items-center justify-between p-3 ${modoOscuro ? "bg-gray-700/50" : "bg-gray-50"} rounded-lg ${tema.bgFilaHover} transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">{formatearHora(turno.created_at)}</div>
                    <div><p className={`font-medium ${tema.textoPrincipal}`}>{turno.cliente_nombre} {turno.cliente_apellido}</p><p className="text-xs text-gray-500">Tel: {turno.cliente_telefono}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">{turno.estado}</span>
                    <button onClick={() => verDetalles(turno.id)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">Ver</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GRÁFICO SEMANAL */}
        {estadisticas && Object.keys(estadisticas.porDia).length > 0 && (
          <div className={`${tema.bgTarjeta} rounded-xl shadow-md p-6 mb-8 border ${tema.bordeTarjeta}`}>
            <h2 className={`text-xl font-bold ${tema.textoPrincipal} mb-4`}>📈 Actividad últimos 7 días</h2>
            <div className="flex items-end gap-2 h-40">
              {Object.entries(estadisticas.porDia).map(([dia, cantidad]) => (
                <div key={dia} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-xs font-semibold ${modoOscuro ? "text-gray-300" : "text-gray-700"}`}>{cantidad}</span>
                  <div className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all" style={{ height: `${(cantidad / maxReservasDia) * 100}%` }}></div>
                  <span className="text-xs text-gray-500 capitalize">{dia}</span>
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
          
          {reservas.length === 0 && <div className={`${tema.bgTarjeta} rounded-xl p-8 text-center shadow-md border ${tema.bordeTarjeta}`}><p className={`${tema.textoSecundario} text-lg`}>No hay reservas todavía</p></div>}
        </div>
      </div>

      {detalles && <ModalDetalles detalles={detalles} onClose={() => setDetalles(null)} onCambiarEstado={cambiarEstado} />}
    </div>
  );
}