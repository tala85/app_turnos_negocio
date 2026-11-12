"use client";

import { useState, useEffect } from "react"; // ✅ Agregado useEffect
import type { Servicio, Combo, ItemReserva, ClienteInput } from "@/lib/types";
import ListaServicios from "./servicios/ListaServicios";
import Calendario from "./turnos/Calendario";
import FormCliente from "./cliente/FormCliente";
import ResumenReserva from "./resumen/ResumenReserva";

type Props = {
  estudioId: string;
  servicios: Servicio[];
  combos: Combo[];
  colores: {
    primario: string;
    secundario: string;
    fondo: string;
  };
};

type HorarioDisponible = {
  inicio: string;
  fin: string;
  slots_necesarios: number;
};

export default function ReservaForm({ estudioId, servicios, combos, colores }: Props) {
  const [serviciosElegidos, setServiciosElegidos] = useState<string[]>([]);
  const [combosElegidos, setCombosElegidos] = useState<string[]>([]);
  const [fecha, setFecha] = useState("");
  
  // ✅ Estado para los slots de horarios del día seleccionado
  const [horariosSlots, setHorariosSlots] = useState<HorarioDisponible[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<HorarioDisponible | null>(null);
  
  // ✅ Estados para la configuración del admin (nombres distintos para no chocar)
  const [horariosAdmin, setHorariosAdmin] = useState<{ dia_semana: number; hora_inicio: string; hora_fin: string }[]>([]);
  const [excepcionesAdmin, setExcepcionesAdmin] = useState<{ fecha: string; hora_inicio: string; hora_fin: string }[]>([]);
  
  const [cliente, setCliente] = useState<ClienteInput>({ dni: "", nombre: "", apellido: "", telefono: "" });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservaExitosa, setReservaExitosa] = useState<{ reservaId: string; total: number; sena: number } | null>(null);

  const calcularTotal = (): { items: ItemReserva[]; total: number; sena: number; minutos: number } => {
    const items: ItemReserva[] = [];
    let total = 0;
    let minutos = 0;

    serviciosElegidos.forEach((id) => {
      const s = servicios.find((x) => x.id === id);
      if (s) {
        items.push({ id: s.id, nombre: s.nombre, precio: s.precio, duracion_min: s.duracion_min });
        total += s.precio;
        minutos += s.duracion_min;
      }
    });

    combosElegidos.forEach((id) => {
      const c = combos.find((x) => x.id === id);
      if (c) {
        const incluidos = c.combo_servicios?.map((r) => servicios.find((s) => s.id === r.servicio_id)).filter(Boolean) || [];
        const duracionCombo = incluidos.reduce((a, s) => a + (s?.duracion_min || 0), 0);
        items.push({ id: `combo-${c.id}`, nombre: `Combo: ${c.nombre}`, precio: c.precio_oferta, duracion_min: duracionCombo });
        total += c.precio_oferta;
        minutos += duracionCombo;
      }
    });

    const sena = Math.round((total * 30) / 100);
    return { items, total, sena, minutos };
  };

  const { items, total, sena, minutos } = calcularTotal();

  const toggleServicio = (id: string) => {
    setServiciosElegidos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setHorarioSeleccionado(null);
  };

  const toggleCombo = (id: string) => {
    setCombosElegidos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setHorarioSeleccionado(null);
  };

  // ✅ Cargar configuración de horarios del admin
  useEffect(() => {
    const cargarConfiguracionHorarios = async () => {
      try {
        const res = await fetch(`/api/admin/horarios?estudioId=${estudioId}`);
        const data = await res.json();
        if (data.ok) {
          setHorariosAdmin(data.data.horarios || []);
          setExcepcionesAdmin(data.data.excepciones || []);
        }
      } catch (error) {
        console.error("Error cargando horarios:", error);
      }
    };
    cargarConfiguracionHorarios();
  }, [estudioId]);

  // ✅ Cargar slots disponibles para la fecha seleccionada
  const cargarHorariosDelDia = async (nuevaFecha: string) => {
    setFecha(nuevaFecha);
    setHorariosSlots([]);
    setHorarioSeleccionado(null);
    if (minutos === 0) return;

    try {
      const res = await fetch(`/api/turnos/horarios-inicio?estudioId=${estudioId}&fecha=${nuevaFecha}&duracionMin=${minutos}`);
      const data = await res.json();
      if (data.ok) setHorariosSlots(data.horarios || []);
    } catch (e) {
      console.error("Error cargando horarios:", e);
    }
  };

  const seleccionarHorario = (horario: HorarioDisponible) => setHorarioSeleccionado(horario);

  const formatearHora = (iso: string) => {
    try {
      const fechaObj = new Date(iso);
      if (isNaN(fechaObj.getTime())) return "Hora no disponible";
      return fechaObj.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });
    } catch {
      return "Hora no disponible";
    }
  };

  const confirmarReserva = async () => {
    if (!horarioSeleccionado) {
      setError("Seleccioná un horario");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const resSlots = await fetch(`/api/turnos/slots?estudioId=${estudioId}&inicio=${encodeURIComponent(horarioSeleccionado.inicio)}&cantidad=${horarioSeleccionado.slots_necesarios}`);
      const dataSlots = await resSlots.json();

      if (!dataSlots.ok) {
        setError(dataSlots.mensaje || "Error al obtener slots");
        return;
      }

      const res = await fetch("/api/reservas/bloqueo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estudioId, turnoIds: dataSlots.turnoIds, servicioIds: serviciosElegidos, comboIds: combosElegidos, cliente }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al reservar");
        return;
      }

      if (data.requiereSena) {
        try {
          const datosParaWhatsApp = {
            clienteNombre: cliente.nombre,
            clienteApellido: cliente.apellido,
            servicios: items.map((item) => item.nombre),
            total: data.total,
            sena: data.sena,
            fecha: new Date(horarioSeleccionado.inicio).toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
            hora: formatearHora(horarioSeleccionado.inicio),
            telefonoEstudio: "3764813696",
          };

          sessionStorage.setItem("reservaExitosa", JSON.stringify(datosParaWhatsApp));

          const resPago = await fetch("/api/pago/crear", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reservaId: data.reservaId, total: data.total, sena: data.sena, cliente }),
          });

          const dataPago = await resPago.json();
          if (!dataPago.ok) {
            setError(dataPago.mensaje || "Error al crear pago");
            return;
          }

          if (dataPago.initPoint) {
            window.location.href = dataPago.initPoint;
          } else {
            setError("No se pudo generar el enlace de pago");
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Error al procesar pago");
        }
      } else {
        setReservaExitosa({ reservaId: data.reservaId, total: data.total, sena: data.sena });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  };

  if (reservaExitosa) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-md text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva confirmada!</h2>
        <p className="text-gray-600 mb-4">Tu turno fue bloqueado por 10 minutos.</p>
        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: `${colores.primario}15` }}>
          <p className="text-sm text-gray-600">Total:</p>
          <p className="text-2xl font-bold" style={{ color: colores.primario }}>${reservaExitosa.total.toLocaleString("es-AR")}</p>
          <p className="text-sm text-gray-600 mt-2">Seña a pagar:</p>
          <p className="text-xl font-bold" style={{ color: colores.primario }}>${reservaExitosa.sena.toLocaleString("es-AR")}</p>
        </div>
        <p className="text-xs text-gray-500">ID de reserva: {reservaExitosa.reservaId}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Elegí tus servicios</h2>
          <ListaServicios
            servicios={servicios}
            combos={combos}
            seleccionados={[...serviciosElegidos, ...combosElegidos]}
            onToggleServicio={toggleServicio}
            onToggleCombo={toggleCombo}
          />
        </section>

        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Elegí el día y horario</h2>
          <div className="space-y-4">
            {/* ✅ Pasamos los estados de configuración al calendario */}
            <Calendario
              fechaSeleccionada={fecha}
              onChange={cargarHorariosDelDia}
              horariosDisponibles={horariosAdmin}
              excepciones={excepcionesAdmin}
            />

            {minutos > 0 && fecha && (
              <div className="rounded-lg p-4 border" style={{ backgroundColor: `${colores.secundario}10`, borderColor: `${colores.secundario}30` }}>
                <p className="text-sm font-medium mb-2" style={{ color: colores.secundario }}>⏱️ Duración total: {minutos} minutos</p>
                
                {/* ✅ Usamos horariosSlots en lugar de horariosDisponibles aquí */}
                {horariosSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {horariosSlots.map((horario, idx) => {
                      const estaSeleccionado = horarioSeleccionado?.inicio === horario.inicio;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => seleccionarHorario(horario)}
                          className="p-3 rounded-lg border-2 text-sm font-medium transition-all hover:opacity-90"
                          style={{
                            borderColor: estaSeleccionado ? colores.primario : "#e5e7eb",
                            backgroundColor: estaSeleccionado ? colores.primario : "white",
                            color: estaSeleccionado ? "white" : "#374151",
                          }}
                        >
                          <div className="font-semibold">{formatearHora(horario.inicio)}</div>
                          <div className="text-xs mt-1">hasta {formatearHora(horario.fin)}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">😔 No hay horarios disponibles para esta fecha</p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: colores.primario }}>3. Tus datos</h2>
          <FormCliente cliente={cliente} onChange={setCliente} />
        </section>
      </div>

      <div className="md:col-span-1">
        <div className="md:sticky md:top-6">
          <ResumenReserva
            items={items}
            total={total}
            sena={sena}
            minutos={minutos}
            requiereSena={true}
            fecha={fecha}
            horario={horarioSeleccionado}
            cliente={cliente}
            onConfirmar={confirmarReserva}
            cargando={cargando}
            error={error}
            colores={colores}
          />
        </div>
      </div>
    </div>
  );
}