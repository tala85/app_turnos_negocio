"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ModalCampana, {
  type CampanaForm,
} from "@/components/admin/ModalCampana";
import { useTema } from "@/lib/admin/tema";

export type Campana = {
  id: string;
  estudio_id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  tipo: "promo" | "jornada" | "urgente";
  combo_id: string | null;
  servicio_id: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  cupos: number | null;
  precio_especial: number | null;
  activa: boolean;
  orden: number;
  created_at: string;
  combos: { nombre: string } | null;
  servicios: { nombre: string } | null;
};

type ComboSimple = { id: string; nombre: string };
type ServicioSimple = { id: string; nombre: string };

const emojiTipo = { promo: "🔥", jornada: "✨", urgente: "⚡" } as const;
const colorTipo = {
  promo: "bg-pink-500/15 text-pink-600",
  jornada: "bg-violet-500/15 text-violet-600",
  urgente: "bg-amber-500/15 text-amber-600",
} as const;

function formatearFecha(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function estadoCampana(c: Campana): { texto: string; clase: string } {
  const hoy = new Date().toISOString().split("T")[0];
  if (!c.activa)
    return { texto: "Pausada", clase: "bg-gray-500/15 text-gray-500" };
  if (hoy < c.fecha_inicio)
    return { texto: "Programada", clase: "bg-blue-500/15 text-blue-600" };
  if (hoy > c.fecha_fin)
    return { texto: "Vencida", clase: "bg-red-500/15 text-red-600" };
  return { texto: "Activa", clase: "bg-emerald-500/15 text-emerald-600" };
}

export default function CampanasClient({
  campanas,
  combos,
  servicios,
}: {
  campanas: Campana[];
  combos: ComboSimple[];
  servicios: ServicioSimple[];
}) {
  const router = useRouter();
  const tema = useTema();
  const [ocupada, setOcupada] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<CampanaForm | null>(null);

  const toggleActiva = async (c: Campana) => {
    setOcupada(c.id);
    try {
      const res = await fetch("/api/admin/campanas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, activa: !c.activa }),
      });
      const data = await res.json();
      if (data.ok) router.refresh();
      else alert(data.mensaje || "Error al actualizar");
    } catch {
      alert("Error de conexión");
    } finally {
      setOcupada(null);
    }
  };

  const borrar = async (c: Campana) => {
    if (
      !confirm(
        `¿Borrar la campaña "${c.titulo}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    setOcupada(c.id);
    try {
      const res = await fetch(`/api/admin/campanas?id=${c.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) router.refresh();
      else alert(data.mensaje || "Error al borrar");
    } catch {
      alert("Error de conexión");
    } finally {
      setOcupada(null);
    }
  };

  // ✅ FIX: recibe CampanaForm (tipo unificado), no Campana
  const guardarCampana = async (data: CampanaForm) => {
    const method = data.id ? "PATCH" : "POST";
    // ✅ FIX: solo spread, sin id redundante
    const body = data.id
      ? { ...data }
      : { estudioId: "2441c401-ae11-4037-ab80-4725c0304840", ...data };

    const res = await fetch("/api/admin/campanas", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.mensaje || "Error al guardar");
    setModalAbierto(false);
    setEditando(null);
    router.refresh();
  };

  const editar = (c: Campana) => {
    // Convertir Campana completo → CampanaForm (los campos extra se ignoran)
    const form: CampanaForm = {
      id: c.id,
      titulo: c.titulo,
      descripcion: c.descripcion,
      imagen_url: c.imagen_url,
      tipo: c.tipo,
      combo_id: c.combo_id,
      servicio_id: c.servicio_id,
      fecha_inicio: c.fecha_inicio,
      fecha_fin: c.fecha_fin,
      cupos: c.cupos,
      precio_especial: c.precio_especial,
      activa: c.activa,
      orden: c.orden,
    };
    setEditando(form);
    setModalAbierto(true);
  };

  return (
    <div
      className={`min-h-screen ${tema.bg} ${tema.texto} transition-colors duration-300`}
    >
      <div className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        <AdminHeader
          tema={tema}
          icono="📢"
          titulo="Campañas y Promociones"
          subtitulo="Creá promos y jornadas que aparecen en tu página de inicio"
          links={[
            {
              href: "/admin/reservas",
              label: "Reservas",
              icono: "📋",
              color: "blue",
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
              href: "/admin/compartir",
              label: "Compartir",
              icono: "📢",
              color: "emerald",
            },
          ]}
        />

        <div className="flex justify-between items-center mb-6">
          <p className={`text-sm ${tema.texto2}`}>
            {campanas.length} campaña{campanas.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => {
              setEditando(null);
              setModalAbierto(true);
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg shrink-0"
          >
            ✨ Nueva campaña
          </button>
        </div>

        {campanas.length === 0 ? (
          <div
            className={`${tema.tarjeta} rounded-2xl p-8 text-center border ${tema.borde}`}
          >
            <p className={`${tema.texto2} text-lg`}>No hay campañas todavía</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {campanas.map((c) => {
              const estado = estadoCampana(c);
              return (
                <div
                  key={c.id}
                  className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-5 shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{emojiTipo[c.tipo]}</span>
                      <h3 className={`font-semibold ${tema.texto}`}>
                        {c.titulo}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.clase}`}
                    >
                      {estado.texto}
                    </span>
                  </div>

                  {c.descripcion && (
                    <p className={`text-sm ${tema.texto2} mb-3`}>
                      {c.descripcion}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs mb-4">
                    <span
                      className={`px-2 py-0.5 rounded-full ${colorTipo[c.tipo]}`}
                    >
                      {c.tipo}
                    </span>
                    {c.precio_especial != null && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">
                        💰 ${c.precio_especial.toLocaleString("es-AR")}
                      </span>
                    )}
                    {c.cupos != null && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600">
                        🎟️ {c.cupos} cupos
                      </span>
                    )}
                    {(c.combos || c.servicios) && (
                      <span
                        className={`px-2 py-0.5 rounded-full ${tema.suave} ${tema.texto2}`}
                      >
                        🔗 {c.combos?.nombre || c.servicios?.nombre}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full ${tema.suave} ${tema.texto2}`}
                    >
                      📅 {formatearFecha(c.fecha_inicio)} →{" "}
                      {formatearFecha(c.fecha_fin)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActiva(c)}
                        disabled={ocupada === c.id}
                        className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
                          c.activa ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                        aria-label={
                          c.activa ? "Pausar campaña" : "Activar campaña"
                        }
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                            c.activa ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                      <span className={`text-xs ${tema.texto2}`}>
                        {c.activa ? "Visible en la web" : "Pausada"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => editar(c)}
                        disabled={ocupada === c.id}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => borrar(c)}
                        disabled={ocupada === c.id}
                        className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
                      >
                        🗑️ Borrar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modalAbierto && (
          <ModalCampana
            campana={editando}
            combos={combos}
            servicios={servicios}
            onClose={() => {
              setModalAbierto(false);
              setEditando(null);
            }}
            onSave={guardarCampana}
          />
        )}
      </div>
    </div>
  );
}
