"use client";

import { useState } from "react";

export type CampanaForm = {
  id?: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  tipo: "promo" | "jornada" | "urgente";
  combo_id: string | null;
  servicio_id: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  fechas_especificas: string[] | null;
  cupos: number | null;
  precio_especial: number | null;
  activa: boolean;
  orden: number;
};

type Props = {
  campana?: CampanaForm | null;
  combos: { id: string; nombre: string }[];
  servicios: { id: string; nombre: string }[];
  onClose: () => void;
  onSave: (data: CampanaForm) => Promise<void>;
};

const HOY = new Date().toISOString().split("T")[0];
const EN_7_DIAS = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

export default function ModalCampana({ campana, combos, servicios, onClose, onSave }: Props) {
  const [form, setForm] = useState<CampanaForm>(
    campana || {
      titulo: "",
      descripcion: "",
      imagen_url: "",
      tipo: "promo",
      combo_id: null,
      servicio_id: null,
      fecha_inicio: HOY,
      fecha_fin: EN_7_DIAS,
      fechas_especificas: null,
      cupos: null,
      precio_especial: null,
      activa: true,
      orden: 0,
    }
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diaNuevo, setDiaNuevo] = useState("");

  const handleChange = <K extends keyof CampanaForm>(field: K, value: CampanaForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const agregarDia = () => {
    if (!diaNuevo) return;
    if (form.fechas_especificas?.includes(diaNuevo)) return;
    handleChange("fechas_especificas", [...(form.fechas_especificas || []), diaNuevo].sort());
    setDiaNuevo("");
  };

  const quitarDia = (d: string) => {
    handleChange("fechas_especificas", (form.fechas_especificas || []).filter((x) => x !== d));
  };

  const formatearDiaChip = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (form.fechas_especificas !== null) {
      if (form.fechas_especificas.length === 0) {
        setError("En modo 'Días puntuales' agregá al menos un día");
        return;
      }
    } else {
      if (!form.fecha_inicio || !form.fecha_fin) {
        setError("Las fechas son obligatorias");
        return;
      }
      if (new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
        setError("La fecha fin debe ser posterior a la fecha inicio");
        return;
      }
    }

    setGuardando(true);
    setError(null);
    try {
      await onSave(form);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {campana?.id ? "Editar campaña" : "Nueva campaña"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              placeholder="🔥 Promo Primavera"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion || ""}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              placeholder="Manicure + Pedicure con 20% OFF"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de campaña *</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "promo", label: "🔥 Promo", desc: "Descuento" },
                { value: "jornada", label: "✨ Jornada", desc: "Evento con cupos" },
                { value: "urgente", label: "⚡ Urgente", desc: "Últimos lugares" },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleChange("tipo", t.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    form.tipo === t.value ? "border-pink-500 bg-pink-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ═══ VIGENCIA: rango o días puntuales ═══ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vigencia *</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleChange("fechas_especificas", null)}
                className={`p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  form.fechas_especificas === null
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                📆 Rango continuo
              </button>
              <button
                type="button"
                onClick={() => handleChange("fechas_especificas", form.fechas_especificas || [])}
                className={`p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  form.fechas_especificas !== null
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                🎯 Días puntuales
              </button>
            </div>

            {form.fechas_especificas === null ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
                  <input
                    type="date"
                    value={form.fecha_inicio}
                    onChange={(e) => handleChange("fecha_inicio", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
                  <input
                    type="date"
                    value={form.fecha_fin}
                    onChange={(e) => handleChange("fecha_fin", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={diaNuevo}
                    onChange={(e) => setDiaNuevo(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    type="button"
                    onClick={agregarDia}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
                  >
                    + Agregar
                  </button>
                </div>

                {form.fechas_especificas.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Agregá al menos un día (ej: los 2 domingos de la jornada)
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {form.fechas_especificas.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 border border-pink-200 text-pink-700 rounded-full text-sm font-medium"
                      >
                        {formatearDiaChip(d)}
                        <button
                          type="button"
                          onClick={() => quitarDia(d)}
                          className="text-pink-400 hover:text-pink-600 font-bold"
                          aria-label={`Quitar ${d}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio especial (opcional)</label>
            <input
              type="number"
              value={form.precio_especial || ""}
              onChange={(e) => handleChange("precio_especial", e.target.value ? Number(e.target.value) : null)}
              placeholder="15000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
            <p className="text-xs text-gray-500 mt-1">Dejá vacío para usar el precio normal</p>
          </div>

          {form.tipo === "jornada" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cupos disponibles</label>
              <input
                type="number"
                value={form.cupos || ""}
                onChange={(e) => handleChange("cupos", e.target.value ? Number(e.target.value) : null)}
                placeholder="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vincular a (opcional)</label>
            <div className="space-y-2">
              <select
                value={form.combo_id || ""}
                onChange={(e) => {
                  handleChange("combo_id", e.target.value || null);
                  if (e.target.value) handleChange("servicio_id", null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Sin combo vinculado</option>
                {combos.map((c) => (
                  <option key={c.id} value={c.id}>Combo: {c.nombre}</option>
                ))}
              </select>
              <select
                value={form.servicio_id || ""}
                onChange={(e) => {
                  handleChange("servicio_id", e.target.value || null);
                  if (e.target.value) handleChange("combo_id", null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Sin servicio vinculado</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>Servicio: {s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            disabled={guardando}
            className="w-full sm:w-auto px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={guardando}
            className="w-full sm:w-auto px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar campaña"}
          </button>
        </div>
      </div>
    </div>
  );
}