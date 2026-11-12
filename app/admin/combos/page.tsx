"use client";

import { useState, useEffect, type FormEvent } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Toaster, useToast } from "@/lib/admin/useToast";
import { useTema } from "@/lib/admin/tema";
import { combosApi } from "@/features/combos/api";
import { serviciosApi } from "@/features/servicios/api";
import { money } from "@/features/servicios/utils";
import type { Servicio } from "@/features/servicios/types";

type Combo = {
  id: string;
  estudio_id: string;
  nombre: string;
  descripcion: string | null;
  precio_oferta: number;
  activo: boolean;
  combo_servicios: { servicio_id: string }[];
};

type FormDatos = {
  nombre: string;
  descripcion: string;
  precio_oferta: string;
  servicio_ids: string[];
};

const FORM_VACIO: FormDatos = {
  nombre: "",
  descripcion: "",
  precio_oferta: "",
  servicio_ids: [],
};

const mensaje = (e: unknown) =>
  e instanceof Error ? e.message : "Error de conexión";

export default function AdminCombosPage() {
  const tema = useTema();
  const { toast, mostrar, cerrar } = useToast();

  const [combos, setCombos] = useState<Combo[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editando, setEditando] = useState<Combo | null>(null);
  const [formDatos, setFormDatos] = useState<FormDatos>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [aEliminar, setAEliminar] = useState<Combo | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar datos
  useEffect(() => {
    let activo = true;
    Promise.all([combosApi.listar(), serviciosApi.listar()])
      .then(([listaCombos, listaServicios]) => {
        if (!activo) return;
        setCombos(listaCombos);
        setServicios(listaServicios);
        setError(null);
      })
      .catch((e: unknown) => {
        if (activo) setError(mensaje(e));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const recargar = async () => {
    try {
      const [listaCombos, listaServicios] = await Promise.all([
        combosApi.listar(),
        serviciosApi.listar(),
      ]);
      setCombos(listaCombos);
      setServicios(listaServicios);
      setError(null);
    } catch (e: unknown) {
      mostrar({ tipo: "error", texto: mensaje(e) });
    }
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (!formValido || guardando) return;

    setGuardando(true);
    const payload = {
      nombre: formDatos.nombre.trim(),
      descripcion: formDatos.descripcion.trim(),
      precio_oferta: Number(formDatos.precio_oferta),
      servicio_ids: formDatos.servicio_ids,
    };

    try {
      if (editando) await combosApi.actualizar(editando.id, payload);
      else await combosApi.crear(payload);

      setEditando(null);
      setFormDatos(FORM_VACIO);
      await recargar();
      mostrar({
        tipo: "ok",
        texto: editando
          ? `"${payload.nombre}" actualizado`
          : `"${payload.nombre}" creado`,
      });
    } catch (err: unknown) {
      mostrar({ tipo: "error", texto: mensaje(err) });
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (combo: Combo) => {
    const nuevoEstado = !combo.activo;
    setCombos((prev) =>
      prev.map((c) => (c.id === combo.id ? { ...c, activo: nuevoEstado } : c)),
    );

    try {
      await combosApi.actualizar(combo.id, { activo: nuevoEstado });
      mostrar({
        tipo: "ok",
        texto: nuevoEstado
          ? `"${combo.nombre}" activado`
          : `"${combo.nombre}" desactivado`,
      });
    } catch (err: unknown) {
      setCombos((prev) =>
        prev.map((c) =>
          c.id === combo.id ? { ...c, activo: combo.activo } : c,
        ),
      );
      mostrar({ tipo: "error", texto: mensaje(err) });
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar || eliminando) return;
    try {
      await combosApi.eliminar(aEliminar.id);
      setCombos((prev) => prev.filter((c) => c.id !== aEliminar.id));
      setAEliminar(null);
      mostrar({ tipo: "info", texto: `"${aEliminar.nombre}" eliminado` });
    } catch (err: unknown) {
      mostrar({ tipo: "error", texto: mensaje(err) });
    } finally {
      setEliminando(false);
    }
  };

  const precioNum = Number(formDatos.precio_oferta);
  const formValido =
    formDatos.nombre.trim().length >= 2 &&
    Number.isFinite(precioNum) &&
    precioNum >= 0 &&
    formDatos.servicio_ids.length > 0;

  return (
    <div
      className={`min-h-screen ${tema.bg} ${tema.texto} transition-colors duration-300`}
    >
      <div className="mx-auto max-w-5xl px-3 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        <AdminHeader
          tema={tema}
          icono="🎁"
          titulo="Gestión de Combos"
          subtitulo="Creá y gestioná combos y ofertas"
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
              color: "blue",
            },
            {
              href: "/admin/configuracion",
              label: "Personalización",
              icono: "🎨",
              color: "fuchsia",
            },
          ]}
        />

        {/* Formulario */}
        <section
          className={`${tema.tarjeta} mb-4 rounded-2xl border ${tema.borde} shadow-sm`}
        >
          <div className="p-4 sm:p-5">
            <h2 className="text-lg font-bold mb-4">
              {editando ? "✏️ Editar combo" : "➕ Nuevo combo"}
            </h2>

            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-1`}
                >
                  Nombre del combo
                </label>
                <input
                  type="text"
                  value={formDatos.nombre}
                  onChange={(e) =>
                    setFormDatos({ ...formDatos, nombre: e.target.value })
                  }
                  placeholder="Ej: Pack Manicura + Pedicura"
                  className={`h-12 w-full rounded-xl border px-4 text-sm text-gray-900 dark:text-gray-100 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${tema.input}`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-1`}
                >
                  Descripción
                </label>
                <textarea
                  value={formDatos.descripcion}
                  onChange={(e) =>
                    setFormDatos({ ...formDatos, descripcion: e.target.value })
                  }
                  placeholder="Ej: Incluye manicura semipermanente y pedicura tradicional"
                  rows={3}
                  className={`w-full rounded-xl border px-4 py-3 text-gray-900 dark:text-gray-100 transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${tema.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-1`}
                >
                  Precio de oferta
                </label>
                <div className="relative">
                  <span
                    className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${tema.texto2}`}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={formDatos.precio_oferta}
                    onChange={(e) =>
                      setFormDatos({
                        ...formDatos,
                        precio_oferta: e.target.value,
                      })
                    }
                    placeholder="0"
                    className={`${tema.input} h-12 w-full rounded-xl border pl-8 pr-4 text-gray-900 dark:text-gray-100 transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25`}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wide ${tema.texto2} mb-2`}
                >
                  Servicios incluidos
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto rounded-xl border border-gray-200 p-2">
                  {servicios.map((s) => {
                    const seleccionado = formDatos.servicio_ids.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          const nuevos = seleccionado
                            ? formDatos.servicio_ids.filter((id) => id !== s.id)
                            : [...formDatos.servicio_ids, s.id];
                          setFormDatos({ ...formDatos, servicio_ids: nuevos });
                        }}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          seleccionado
                            ? "border-pink-500 bg-pink-500/10 text-pink-600"
                            : `${tema.borde} ${tema.suave} ${tema.texto2}`
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{s.nombre}</span>
                          {seleccionado && <span className="text-lg">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {formDatos.servicio_ids.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    Seleccioná al menos un servicio
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!formValido || guardando}
                  className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all disabled:opacity-45 ${tema.btnPrimario}`}
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                      ? "💾 Actualizar"
                      : "💾 Guardar combo"}
                </button>
                {editando && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(null);
                      setFormDatos(FORM_VACIO);
                    }}
                    className={`h-12 px-6 rounded-xl text-sm font-bold ${tema.btnNeutro}`}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Lista de combos */}
        <div className="space-y-3">
          {cargando ? (
            <p className={`text-center py-8 ${tema.texto2}`}>
              Cargando combos...
            </p>
          ) : error ? (
            <div
              className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-8 text-center`}
            >
              <p className="text-3xl mb-2">⚠️</p>
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={recargar}
                className={`mt-4 h-11 rounded-xl px-6 text-sm font-bold ${tema.btnPrimario}`}
              >
                Reintentar
              </button>
            </div>
          ) : combos.length === 0 ? (
            <div
              className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-10 text-center`}
            >
              <p className="text-3xl mb-2">🎁</p>
              <p className={`font-semibold ${tema.texto}`}>
                No hay combos creados
              </p>
              <p className={`text-sm ${tema.texto2}`}>
                Creá tu primer combo para ofrecer descuentos
              </p>
            </div>
          ) : (
            combos.map((combo) => (
              <div
                key={combo.id}
                className={`${tema.tarjeta} rounded-2xl border ${tema.borde} p-4 shadow-sm`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`font-bold text-lg ${tema.texto}`}>
                      {combo.nombre}
                    </h3>
                    {combo.descripcion && (
                      <p className={`text-sm ${tema.texto2} mt-1`}>
                        {combo.descripcion}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {combo.combo_servicios.length} servicio
                      {combo.combo_servicios.length !== 1 ? "s" : ""} incluido
                      {combo.combo_servicios.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-pink-600">
                      {money(combo.precio_oferta)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${tema.badge(combo.activo)}`}
                    >
                      {combo.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setEditando(combo);
                      setFormDatos({
                        nombre: combo.nombre,
                        descripcion: combo.descripcion ?? "",
                        precio_oferta: String(combo.precio_oferta),
                        servicio_ids: combo.combo_servicios.map(
                          (s) => s.servicio_id,
                        ),
                      });
                    }}
                    className="flex-1 bg-blue-500/15 text-blue-600 py-2 rounded-xl text-sm font-semibold hover:bg-blue-500/25"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => toggleActivo(combo)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold ${
                      combo.activo
                        ? "bg-amber-500/15 text-amber-600"
                        : "bg-emerald-500/15 text-emerald-600"
                    }`}
                  >
                    {combo.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => setAEliminar(combo)}
                    className="flex-1 bg-red-500/15 text-red-600 py-2 rounded-xl text-sm font-semibold hover:bg-red-500/25"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        tema={tema}
        titulo="¿Eliminar combo?"
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      >
        {aEliminar && (
          <>
            Vas a eliminar{" "}
            <strong className={tema.texto}>
              &ldquo;{aEliminar.nombre}&rdquo;
            </strong>
            . Esta acción no se puede deshacer.
          </>
        )}
      </ConfirmDialog>

      <Toaster toast={toast} onCerrar={cerrar} />
    </div>
  );
}
