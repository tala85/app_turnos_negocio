"use client";

import { useState, useEffect, type FormEvent } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Toaster, useToast } from "@/lib/admin/useToast";
import { useTema } from "@/lib/admin/tema";
import InputFecha from "@/components/ui/InputFecha";

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

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const API = "/api/admin/horarios";

const ESTILOS_INPUTS = `
  input[type="time"], input[type="date"] { color-scheme: light; }
  .dark input[type="time"], .dark input[type="date"] { color-scheme: dark; }
`;

export default function AdminHorariosPage() {
  const tema = useTema();
  const { toast, mostrar, cerrar } = useToast();

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [excepciones, setExcepciones] = useState<Excepcion[]>([]);
  const [cargando, setCargando] = useState(true);

  // ✅ NUEVO: Estados para carga masiva
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]); // Lun-Vie por defecto
  const [franjas, setFranjas] = useState([
    { hora_inicio: "09:00", hora_fin: "18:00" },
  ]);

  const [nuevaExcepcion, setNuevaExcepcion] = useState({
    fecha: "",
    hora_inicio: "09:00",
    hora_fin: "18:00",
  });
  const [aEliminar, setAEliminar] = useState<{
    tipo: "horario" | "excepcion";
    id: string;
    nombre: string;
  } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const res = await fetch(API);
        const data = await res.json();
        if (data.ok) {
          setHorarios(data.data.horarios || []);
          setExcepciones(data.data.excepciones || []);
        } else {
          mostrar({ tipo: "error", texto: data.mensaje });
        }
      } catch {
        mostrar({
          tipo: "error",
          texto: "Error de conexión al cargar horarios",
        });
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [mostrar]);

  const recargar = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (data.ok) {
        setHorarios(data.data.horarios || []);
        setExcepciones(data.data.excepciones || []);
      }
    } catch (error) {
      console.error("Error recargando:", error);
    }
  };

  // ✅ NUEVO: Lógica de carga masiva
  const toggleDia = (dia: number) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia)
        ? prev.filter((d) => d !== dia)
        : [...prev, dia].sort(),
    );
  };

  const agregarFranja = () =>
    setFranjas([...franjas, { hora_inicio: "09:00", hora_fin: "18:00" }]);

  const actualizarFranja = (
    index: number,
    campo: "hora_inicio" | "hora_fin",
    valor: string,
  ) => {
    const nuevas = [...franjas];
    nuevas[index][campo] = valor;
    setFranjas(nuevas);
  };

  const eliminarFranja = (index: number) => {
    if (franjas.length > 1) setFranjas(franjas.filter((_, i) => i !== index));
  };

  const guardarHorariosMasivo = async (e: FormEvent) => {
    e.preventDefault();
    if (diasSeleccionados.length === 0) {
      mostrar({ tipo: "error", texto: "Seleccioná al menos un día" });
      return;
    }

    // Generar combinaciones, filtrando las que ya existen
    const horariosAInsertar = [];
    for (const dia of diasSeleccionados) {
      for (const franja of franjas) {
        const yaExiste = horarios.some(
          (h) =>
            h.dia_semana === dia &&
            h.hora_inicio === franja.hora_inicio &&
            h.hora_fin === franja.hora_fin,
        );
        if (!yaExiste) {
          horariosAInsertar.push({
            dia_semana: dia,
            hora_inicio: franja.hora_inicio,
            hora_fin: franja.hora_fin,
          });
        }
      }
    }

    if (horariosAInsertar.length === 0) {
      mostrar({ tipo: "error", texto: "Esos horarios ya están configurados" });
      return;
    }

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "horarios_masivo",
          datos: horariosAInsertar,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        mostrar({
          tipo: "ok",
          texto: `Se aplicaron ${horariosAInsertar.length} horarios`,
        });
        setFranjas([{ hora_inicio: "09:00", hora_fin: "18:00" }]); // Resetear a 1 franja
        recargar();
      } else {
        mostrar({ tipo: "error", texto: data.mensaje });
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error al guardar" });
    }
  };

  // ... (guardarExcepcion, duplicarHorario, duplicarExcepcion, confirmarEliminar se mantienen igual)
  const guardarExcepcion = async (e: FormEvent) => {
    e.preventDefault();
    if (!nuevaExcepcion.fecha) return;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "excepcion",
          datos: nuevaExcepcion,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        mostrar({ tipo: "ok", texto: "Excepción agregada" });
        setNuevaExcepcion({
          fecha: "",
          hora_inicio: "09:00",
          hora_fin: "18:00",
        });
        recargar();
      } else {
        mostrar({ tipo: "error", texto: data.mensaje });
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error al guardar" });
    }
  };

  const duplicarHorario = async (h: Horario) => {
    const diaSiguiente = (h.dia_semana + 1) % 7;
    const nombre = DIAS_SEMANA[diaSiguiente];
    if (
      horarios.some(
        (x) =>
          x.dia_semana === diaSiguiente &&
          x.hora_inicio === h.hora_inicio &&
          x.hora_fin === h.hora_fin,
      )
    ) {
      mostrar({ tipo: "error", texto: `Ya existe para ${nombre}` });
      return;
    }
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "horario",
          datos: {
            dia_semana: diaSiguiente,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        mostrar({ tipo: "ok", texto: `Duplicado para ${nombre}` });
        recargar();
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error al duplicar" });
    }
  };

  const duplicarExcepcion = async (e: Excepcion) => {
    const fecha = new Date(e.fecha + "T00:00:00");
    fecha.setDate(fecha.getDate() + 1);
    const fechaStr = fecha.toISOString().split("T")[0];
    const nombre = fecha.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (
      excepciones.some(
        (x) =>
          x.fecha === fechaStr &&
          x.hora_inicio === e.hora_inicio &&
          x.hora_fin === e.hora_fin,
      )
    ) {
      mostrar({ tipo: "error", texto: `Ya existe para ${nombre}` });
      return;
    }
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "excepcion",
          datos: {
            fecha: fechaStr,
            hora_inicio: e.hora_inicio,
            hora_fin: e.hora_fin,
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        mostrar({ tipo: "ok", texto: `Duplicado para ${nombre}` });
        recargar();
      }
    } catch {
      mostrar({ tipo: "error", texto: "Error al duplicar" });
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      const res = await fetch(
        `${API}?id=${aEliminar.id}&tipo=${aEliminar.tipo}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (data.ok) {
        mostrar({ tipo: "ok", texto: "Eliminado" });
        recargar();
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

  return (
    <div
      className={`min-h-screen ${tema.bg} ${tema.texto} transition-colors duration-300`}
      style={{ opacity: tema.listo ? 1 : 0, transition: "opacity 150ms" }}
    >
      <style dangerouslySetInnerHTML={{ __html: ESTILOS_INPUTS }} />
      <div className="mx-auto max-w-5xl px-3 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        <AdminHeader
          tema={tema}
          icono="🕒"
          titulo="Gestión de Horarios"
          subtitulo="Configurá tus días y horas de atención"
          links={[
            {
              href: "/admin/reservas",
              label: "Reservas",
              icono: "📋",
              color: "emerald",
            },
            {
              href: "/admin/servicios",
              label: "Servicios",
              icono: "💅",
              color: "pink",
            },
            {
              href: "/admin/combos",
              label: "Combos",
              icono: "🎁",
              color: "purple",
            },
            {
              href: "/admin/configuracion",
              label: "Personalización",
              icono: "🎨",
              color: "fuchsia",
            },
          ]}
        />

        {/* Formularios */}
        <div className="grid gap-5 md:grid-cols-2 mb-8">
          {/* ✅ NUEVO: Horario Habitual Masivo */}
          <section
            className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-5 shadow-sm`}
          >
            <h2
              className={`text-base font-semibold tracking-tight ${tema.texto} mb-1`}
            >
              📅 Horario habitual (Carga rápida)
            </h2>
            <p className={`text-xs ${tema.texto2} mb-4`}>
              Seleccioná los días y las franjas. Se aplicarán a todos los días
              elegidos de una vez.
            </p>

            <form onSubmit={guardarHorariosMasivo} className="space-y-5">
              {/* Selector de días */}
              <div>
                <label
                  className={`block text-xs font-medium uppercase tracking-wide ${tema.texto2} mb-2`}
                >
                  Días de la semana
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((dia, idx) => {
                    const seleccionado = diasSeleccionados.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDia(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          seleccionado
                            ? "bg-pink-500 text-white border-pink-500"
                            : `${tema.input} border-transparent hover:border-pink-300`
                        }`}
                      >
                        {dia.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Franjas horarias */}
              <div>
                <label
                  className={`block text-xs font-medium uppercase tracking-wide ${tema.texto2} mb-2`}
                >
                  Franjas horarias
                </label>
                <div className="space-y-3">
                  {franjas.map((franja, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={franja.hora_inicio}
                        onChange={(e) =>
                          actualizarFranja(index, "hora_inicio", e.target.value)
                        }
                        className={`h-10 flex-1 rounded-lg border px-3 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 ${tema.input}`}
                        required
                      />
                      <span className={tema.texto2}>a</span>
                      <input
                        type="time"
                        value={franja.hora_fin}
                        onChange={(e) =>
                          actualizarFranja(index, "hora_fin", e.target.value)
                        }
                        className={`h-10 flex-1 rounded-lg border px-3 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 ${tema.input}`}
                        required
                      />
                      {franjas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarFranja(index)}
                          className="h-10 w-10 grid place-items-center rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Eliminar franja"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={agregarFranja}
                  className="mt-3 text-xs font-medium text-pink-500 hover:text-pink-600 flex items-center gap-1"
                >
                  + Agregar otra franja
                </button>
              </div>

              <button
                type="submit"
                className={`w-full h-10 text-sm ${tema.btnPrimario}`}
              >
                💾 Aplicar a días seleccionados
              </button>
            </form>
          </section>

          {/* Excepción (se mantiene igual) */}
          <section
            className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-5 shadow-sm`}
          >
            <h2
              className={`text-base font-semibold tracking-tight ${tema.texto} mb-1`}
            >
              ⭐ Día extra
            </h2>
            <p className={`text-xs ${tema.texto2} mb-4`}>
              Para un día puntual (feriado, sábado extra, etc.).
            </p>
            <form onSubmit={guardarExcepcion} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-medium uppercase tracking-wide ${tema.texto2} mb-1.5`}
                >
                  Fecha
                </label>
                <InputFecha
                  value={nuevaExcepcion.fecha}
                  onChange={(v) =>
                    setNuevaExcepcion({ ...nuevaExcepcion, fecha: v })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                  inputClass={tema.input}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-medium uppercase tracking-wide ${tema.texto2} mb-1.5`}
                  >
                    Inicio
                  </label>
                  <input
                    type="time"
                    value={nuevaExcepcion.hora_inicio}
                    onChange={(e) =>
                      setNuevaExcepcion({
                        ...nuevaExcepcion,
                        hora_inicio: e.target.value,
                      })
                    }
                    className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 ${tema.input}`}
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium uppercase tracking-wide ${tema.texto2} mb-1.5`}
                  >
                    Fin
                  </label>
                  <input
                    type="time"
                    value={nuevaExcepcion.hora_fin}
                    onChange={(e) =>
                      setNuevaExcepcion({
                        ...nuevaExcepcion,
                        hora_fin: e.target.value,
                      })
                    }
                    className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 ${tema.input}`}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className={`w-full h-10 text-sm ${tema.btnPrimario}`}
              >
                + Agregar día extra
              </button>
            </form>
          </section>
        </div>

        {/* Listados (se mantienen exactamente igual que en tu código original) */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Horarios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-sm font-semibold tracking-tight ${tema.texto}`}
              >
                Horarios configurados
              </h3>
              <span className={`text-xs ${tema.texto2}`}>
                {horarios.length}
              </span>
            </div>
            {cargando ? (
              <p className={`text-center py-6 text-sm ${tema.texto2}`}>
                Cargando…
              </p>
            ) : horarios.length === 0 ? (
              <div
                className={`${tema.tarjeta} rounded-xl border ${tema.borde} p-6 text-center`}
              >
                <p className={`text-sm ${tema.texto2}`}>Sin horarios todavía</p>
              </div>
            ) : (
              <div className="space-y-2">
                {horarios.map((h) => {
                  const diaSig = DIAS_SEMANA[(h.dia_semana + 1) % 7];
                  return (
                    <div
                      key={h.id}
                      className={`${tema.tarjeta} border ${tema.borde} rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 shadow-sm`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${tema.texto}`}>
                          {DIAS_SEMANA[h.dia_semana]}
                        </p>
                        <p className={`text-xs ${tema.texto2}`}>
                          {h.hora_inicio} – {h.hora_fin}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => duplicarHorario(h)}
                          title={`Duplicar para ${diaSig}`}
                          className="h-8 w-8 grid place-items-center rounded-lg text-xs text-blue-500 hover:bg-blue-500/10 transition-colors"
                        >
                          📋
                        </button>
                        <button
                          onClick={() =>
                            setAEliminar({
                              tipo: "horario",
                              id: h.id,
                              nombre: DIAS_SEMANA[h.dia_semana],
                            })
                          }
                          title="Eliminar"
                          className="h-8 w-8 grid place-items-center rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors"
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

          {/* Excepciones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-sm font-semibold tracking-tight ${tema.texto}`}
              >
                Días extra
              </h3>
              <span className={`text-xs ${tema.texto2}`}>
                {excepciones.length}
              </span>
            </div>
            {cargando ? (
              <p className={`text-center py-6 text-sm ${tema.texto2}`}>
                Cargando…
              </p>
            ) : excepciones.length === 0 ? (
              <div
                className={`${tema.tarjeta} rounded-xl border ${tema.borde} p-6 text-center`}
              >
                <p className={`text-sm ${tema.texto2}`}>Sin excepciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {excepciones.map((e) => {
                  const fechaObj = new Date(e.fecha + "T00:00:00");
                  const siguiente = new Date(fechaObj);
                  siguiente.setDate(fechaObj.getDate() + 1);
                  const nombreSiguiente = siguiente.toLocaleDateString(
                    "es-AR",
                    { weekday: "long" },
                  );
                  return (
                    <div
                      key={e.id}
                      className={`${tema.tarjeta} border ${tema.borde} rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 shadow-sm`}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium capitalize ${tema.texto}`}
                        >
                          {fechaObj.toLocaleDateString("es-AR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <p className={`text-xs ${tema.texto2}`}>
                          {e.hora_inicio} – {e.hora_fin}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => duplicarExcepcion(e)}
                          title={`Duplicar para ${nombreSiguiente}`}
                          className="h-8 w-8 grid place-items-center rounded-lg text-xs text-blue-500 hover:bg-blue-500/10 transition-colors"
                        >
                          📋
                        </button>
                        <button
                          onClick={() =>
                            setAEliminar({
                              tipo: "excepcion",
                              id: e.id,
                              nombre: e.fecha,
                            })
                          }
                          title="Eliminar"
                          className="h-8 w-8 grid place-items-center rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors"
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
        {aEliminar && (
          <>
            Vas a eliminar el horario de{" "}
            <strong className={tema.texto}>{aEliminar.nombre}</strong>.
          </>
        )}
      </ConfirmDialog>
      <Toaster toast={toast} onCerrar={cerrar} />
    </div>
  );
}
