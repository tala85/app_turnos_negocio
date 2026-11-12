"use client";

import { useState, useEffect, type FormEvent } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SelectPersonalizado from "@/components/ui/SelectPersonalizado";
import { Toaster, useToast } from "@/lib/admin/useToast";
import { useTema } from "@/lib/admin/tema";

type Horario = {
  id: string;
  estudio_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
};

type Excepcion = {
  id: string;
  estudio_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";
const API = "/api/admin/horarios";

const ESTILOS_INPUTS = `
  input[type="time"],
  input[type="date"] {
    color-scheme: light;
  }
  .dark input[type="time"],
  .dark input[type="date"] {
    color-scheme: dark;
  }
`;

export default function AdminHorariosPage() {
  const tema = useTema();
  const { toast, mostrar, cerrar } = useToast();

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [excepciones, setExcepciones] = useState<Excepcion[]>([]);
  const [cargando, setCargando] = useState(true);

  const [nuevoHorario, setNuevoHorario] = useState({ dia_semana: 1, hora_inicio: "09:00", hora_fin: "18:00" });
  const [nuevaExcepcion, setNuevaExcepcion] = useState({ fecha: "", hora_inicio: "09:00", hora_fin: "18:00" });
  const [aEliminar, setAEliminar] = useState<{ tipo: "horario" | "excepcion"; id: string; nombre: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const cargarDatosInicial = async () => {
      setCargando(true);
      try {
        const res = await fetch(`${API}?estudioId=${ESTUDIO_ID}`);
        const data = await res.json();
        if (data.ok) {
          setHorarios(data.data.horarios || []);
          setExcepciones(data.data.excepciones || []);
        } else {
          mostrar({ tipo: "error", texto: data.mensaje });
        }
      } catch {
        mostrar({ tipo: "error", texto: "Error de conexión al cargar horarios" });
      } finally {
        setCargando(false);
      }
    };
    cargarDatosInicial();
  }, [mostrar]);

  const recargarDatos = async () => {
    try {
      const res = await fetch(`${API}?estudioId=${ESTUDIO_ID}`);
      const data = await res.json();
      if (data.ok) {
        setHorarios(data.data.horarios || []);
        setExcepciones(data.data.excepciones || []);
      }
    } catch (error) {
      console.error("Error recargando:", error);
    }
  };

  const guardarHorario = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estudioId: ESTUDIO_ID, tipo: "horario", datos: nuevoHorario }),
      });
      const data = await res.json();
      if (data.ok) {
        mostrar({ tipo: "ok", texto: "Horario semanal agregado" });
        setNuevoHorario({ dia_semana: 1, hora_inicio: "09:00", hora_fin: "18:00" });
        recargarDatos();
      } else {
        mostrar({ tipo: "error", texto: data.mensaje });
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error al guardar" });
    }
  };

  const guardarExcepcion = async (e: FormEvent) => {
    e.preventDefault();
    if (!nuevaExcepcion.fecha) return;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estudioId: ESTUDIO_ID, tipo: "excepcion", datos: nuevaExcepcion }),
      });
      const data = await res.json();
      if (data.ok) {
        mostrar({ tipo: "ok", texto: "Excepción agregada" });
        setNuevaExcepcion({ fecha: "", hora_inicio: "09:00", hora_fin: "18:00" });
        recargarDatos();
      } else {
        mostrar({ tipo: "error", texto: data.mensaje });
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error al guardar" });
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      const res = await fetch(`${API}?id=${aEliminar.id}&tipo=${aEliminar.tipo}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        mostrar({ tipo: "ok", texto: "Eliminado correctamente" });
        recargarDatos();
      } else {
        mostrar({ tipo: "error", texto: data.mensaje });
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error al eliminar" });
    } finally {
      setEliminando(false);
      setAEliminar(null);
    }
  };

  // 🆕 DUPLICAR HORARIO AL DÍA SIGUIENTE
  const duplicarHorario = async (horario: Horario) => {
    const diaSiguiente = (horario.dia_semana + 1) % 7;
    const nombreDiaSiguiente = DIAS_SEMANA[diaSiguiente];

    // Verificar si ya existe ese horario para el día siguiente
    const yaExiste = horarios.some(
      (h) =>
        h.dia_semana === diaSiguiente &&
        h.hora_inicio === horario.hora_inicio &&
        h.hora_fin === horario.hora_fin
    );

    if (yaExiste) {
      mostrar({
        tipo: "error",
        texto: `Ya existe un horario para ${nombreDiaSiguiente} de ${horario.hora_inicio} a ${horario.hora_fin}`,
      });
      return;
    }

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudioId: ESTUDIO_ID,
          tipo: "horario",
          datos: {
            dia_semana: diaSiguiente,
            hora_inicio: horario.hora_inicio,
            hora_fin: horario.hora_fin,
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        mostrar({
          tipo: "ok",
          texto: `Horario duplicado para ${nombreDiaSiguiente} (${horario.hora_inicio} a ${horario.hora_fin})`,
        });
        recargarDatos();
      } else {
        mostrar({ tipo: "error", texto: data.mensaje });
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error al duplicar" });
    }
  };

  // 🆕 DUPLICAR EXCEPCIÓN AL DÍA SIGUIENTE
  const duplicarExcepcion = async (excepcion: Excepcion) => {
    const fechaActual = new Date(excepcion.fecha + "T00:00:00");
    const fechaSiguiente = new Date(fechaActual);
    fechaSiguiente.setDate(fechaActual.getDate() + 1);
    const fechaStr = fechaSiguiente.toISOString().split("T")[0];

    const nombreDiaSiguiente = fechaSiguiente.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // Verificar si ya existe
    const yaExiste = excepciones.some(
      (e) => e.fecha === fechaStr && e.hora_inicio === excepcion.hora_inicio && e.hora_fin === excepcion.hora_fin
    );

    if (yaExiste) {
      mostrar({
        tipo: "error",
        texto: `Ya existe una excepción para ${nombreDiaSiguiente}`,
      });
      return;
    }

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudioId: ESTUDIO_ID,
          tipo: "excepcion",
          datos: {
            fecha: fechaStr,
            hora_inicio: excepcion.hora_inicio,
            hora_fin: excepcion.hora_fin,
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        mostrar({
          tipo: "ok",
          texto: `Excepción duplicada para ${nombreDiaSiguiente}`,
        });
        recargarDatos();
      } else {
        mostrar({ tipo: "error", texto: data.mensaje });
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error al duplicar" });
    }
  };

  const opcionesDias = DIAS_SEMANA.map((dia, idx) => ({ valor: idx, etiqueta: dia }));

  return (
    <div className={`min-h-screen ${tema.bg} ${tema.texto} transition-colors duration-300 ${tema.oscuro ? "dark" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: ESTILOS_INPUTS }} />

      <div className="mx-auto max-w-5xl px-3 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        <AdminHeader
          tema={tema}
          icono="🕒"
          titulo="Gestión de Horarios"
          subtitulo="Configurá tus días y horas de atención habituales y excepciones"
          links={[
            { href: "/admin/reservas", label: "Reservas", icono: "📋", color: "emerald" },
            { href: "/admin/servicios", label: "Servicios", icono: "💅", color: "blue" },
            { href: "/admin/combos", label: "Combos", icono: "🎁", color: "purple" },
          ]}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Formulario Horario Semanal */}
          <section className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-5 shadow-sm`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">📅 Horario Habitual</h2>
            <form onSubmit={guardarHorario} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-1`}>Día de la semana</label>
                <SelectPersonalizado
                  opciones={opcionesDias}
                  valor={nuevoHorario.dia_semana}
                  onChange={(valor) => setNuevoHorario({ ...nuevoHorario, dia_semana: Number(valor) })}
                  placeholder="Seleccioná un día"
                  tema={tema}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-1`}>Inicio</label>
                  <input
                    type="time"
                    value={nuevoHorario.hora_inicio}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, hora_inicio: e.target.value })}
                    className={`h-12 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-pink-500 ${tema.input} ${tema.texto}`}
                    style={{ colorScheme: tema.oscuro ? "dark" : "light" }}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-1`}>Fin</label>
                  <input
                    type="time"
                    value={nuevoHorario.hora_fin}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, hora_fin: e.target.value })}
                    className={`h-12 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-pink-500 ${tema.input} ${tema.texto}`}
                    style={{ colorScheme: tema.oscuro ? "dark" : "light" }}
                    required
                  />
                </div>
              </div>
              <button type="submit" className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${tema.btnPrimario}`}>
                ➕ Agregar horario habitual
              </button>
            </form>
          </section>

          {/* Formulario Excepciones */}
          <section className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-5 shadow-sm`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">⭐ Día Extra / Excepción</h2>
            <form onSubmit={guardarExcepcion} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-1`}>Fecha específica</label>
                <input
                  type="date"
                  value={nuevaExcepcion.fecha}
                  onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, fecha: e.target.value })}
                  className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${tema.input} ${tema.texto}`}
                  style={{ colorScheme: tema.oscuro ? "dark" : "light" }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-1`}>Inicio</label>
                  <input
                    type="time"
                    value={nuevaExcepcion.hora_inicio}
                    onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, hora_inicio: e.target.value })}
                    className={`h-12 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-pink-500 ${tema.input} ${tema.texto}`}
                    style={{ colorScheme: tema.oscuro ? "dark" : "light" }}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-1`}>Fin</label>
                  <input
                    type="time"
                    value={nuevaExcepcion.hora_fin}
                    onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, hora_fin: e.target.value })}
                    className={`h-12 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-pink-500 ${tema.input} ${tema.texto}`}
                    style={{ colorScheme: tema.oscuro ? "dark" : "light" }}
                    required
                  />
                </div>
              </div>
              <button type="submit" className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${tema.btnPrimario}`}>
                ➕ Agregar día extra
              </button>
            </form>
          </section>
        </div>

        {/* Listado */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Lista de Horarios */}
          <div>
            <h3 className={`text-lg font-bold mb-3 ${tema.texto}`}>📅 Horarios configurados</h3>
            {cargando ? (
              <p className={`text-center py-4 ${tema.texto2}`}>Cargando...</p>
            ) : horarios.length === 0 ? (
              <p className={`text-center py-4 ${tema.texto2}`}>No hay horarios habituales</p>
            ) : (
              <div className="space-y-2">
                {horarios.map((h) => {
                  const diaSiguiente = (h.dia_semana + 1) % 7;
                  return (
                    <div key={h.id} className={`${tema.tarjeta} border ${tema.borde} rounded-xl p-3 flex justify-between items-center gap-2`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{DIAS_SEMANA[h.dia_semana]}</p>
                        <p className={`text-sm ${tema.texto2}`}>{h.hora_inicio} a {h.hora_fin}</p>
                      </div>
                      <div className="flex gap-1">
                        {/* 🆕 Botón duplicar al día siguiente */}
                        <button
                          onClick={() => duplicarHorario(h)}
                          title={`Duplicar para ${DIAS_SEMANA[diaSiguiente]}`}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                          aria-label={`Duplicar horario para ${DIAS_SEMANA[diaSiguiente]}`}
                        >
                          📋
                        </button>
                        <button
                          onClick={() => setAEliminar({ tipo: "horario", id: h.id, nombre: DIAS_SEMANA[h.dia_semana] })}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          aria-label="Eliminar horario"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lista de Excepciones */}
          <div>
            <h3 className={`text-lg font-bold mb-3 ${tema.texto}`}>⭐ Días extra / Excepciones</h3>
            {cargando ? (
              <p className={`text-center py-4 ${tema.texto2}`}>Cargando...</p>
            ) : excepciones.length === 0 ? (
              <p className={`text-center py-4 ${tema.texto2}`}>No hay excepciones</p>
            ) : (
              <div className="space-y-2">
                {excepciones.map((e) => {
                  const fechaActual = new Date(e.fecha + "T00:00:00");
                  const fechaSiguiente = new Date(fechaActual);
                  fechaSiguiente.setDate(fechaActual.getDate() + 1);
                  return (
                    <div key={e.id} className={`${tema.tarjeta} border ${tema.borde} rounded-xl p-3 flex justify-between items-center gap-2`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold capitalize">
                          {fechaActual.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <p className={`text-sm ${tema.texto2}`}>{e.hora_inicio} a {e.hora_fin}</p>
                      </div>
                      <div className="flex gap-1">
                        {/* 🆕 Botón duplicar al día siguiente */}
                        <button
                          onClick={() => duplicarExcepcion(e)}
                          title="Duplicar para el día siguiente"
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                          aria-label="Duplicar excepción para el día siguiente"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => setAEliminar({ tipo: "excepcion", id: e.id, nombre: e.fecha })}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          aria-label="Eliminar excepción"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        tema={tema}
        titulo="¿Eliminar este horario?"
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      >
        {aEliminar && <>Vas a eliminar el horario para <strong className={tema.texto}>&ldquo;{aEliminar.nombre}&rdquo;</strong>.</>}
      </ConfirmDialog>

      <Toaster toast={toast} onCerrar={cerrar} />
    </div>
  );
}