"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useModoOscuro } from "@/hooks/useModoOscuro";

type Servicio = {
  id: string;
  estudio_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_min: number;
  activo: boolean;
};

type FormDatos = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion_min: string;
};

type Filtro = "todos" | "activos" | "inactivos";
type Orden = "nombre" | "precio-asc" | "precio-desc" | "duracion";
type Toast = {
  id: number;
  tipo: "ok" | "error" | "info";
  texto: string;
  deshacer?: () => void;
};

const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";
const API = "/api/admin/servicios";
const DURACIONES = [15, 20, 30, 45, 60, 90, 120];
const FORM_VACIO: FormDatos = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_min: "30",
};

async function pedirServicios(): Promise<Servicio[]> {
  const res = await fetch(`${API}?estudioId=${ESTUDIO_ID}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.mensaje || "No se pudieron cargar los servicios");
  }
  return (data.data ?? []) as Servicio[];
}

function money(n: number) {
  return `$${Number(n || 0).toLocaleString("es-AR")}`;
}

function duracionTexto(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const CSS = `
.svc-scroll::-webkit-scrollbar{width:8px;height:8px}
.svc-scroll::-webkit-scrollbar-track{background:transparent}
.svc-scroll::-webkit-scrollbar-thumb{background:#ec4899;border-radius:99px}
.svc-scroll::-webkit-scrollbar-thumb:hover{background:#be185d}
.svc-scroll{scrollbar-width:thin;scrollbar-color:#ec4899 transparent}
@keyframes svcIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes svcToast{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
@keyframes svcSheet{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
.svc-in{animation:svcIn .3s ease-out both}
.svc-toast{animation:svcToast .25s ease-out both}
.svc-sheet{animation:svcSheet .3s cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion:reduce){.svc-in,.svc-toast,.svc-sheet{animation:none}}
`;

export default function AdminServiciosPage() {
  const { modoOscuro, setModoOscuro } = useModoOscuro();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [editando, setEditando] = useState<Servicio | null>(null);
  const [formDatos, setFormDatos] = useState<FormDatos>(FORM_VACIO);
  const [formVisible, setFormVisible] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Servicio | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [orden, setOrden] = useState<Orden>("nombre");
  const [toast, setToast] = useState<Toast | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);
  const nombreRef = useRef<HTMLInputElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- carga inicial ----------
  useEffect(() => {
    let activo = true;
    pedirServicios()
      .then((lista) => {
        if (!activo) return;
        setServicios(lista);
        setErrorCarga(null);
      })
      .catch((e: unknown) => {
        if (!activo) return;
        setErrorCarga(e instanceof Error ? e.message : "Error de conexión");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ---------- modal: escape + bloqueo de scroll ----------
  useEffect(() => {
    if (!aEliminar) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAEliminar(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", onKey);
    };
  }, [aEliminar]);

  // ---------- helpers ----------
  const mostrarToast = (t: Omit<Toast, "id">) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ ...t, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), t.deshacer ? 8000 : 3200);
  };

  const recargar = async () => {
    try {
      const lista = await pedirServicios();
      setServicios(lista);
      setErrorCarga(null);
    } catch (e: unknown) {
      mostrarToast({
        tipo: "error",
        texto: e instanceof Error ? e.message : "Error de conexión",
      });
    }
  };

  const reintentar = () => {
    setCargando(true);
    setErrorCarga(null);
    pedirServicios()
      .then((lista) => setServicios(lista))
      .catch((e: unknown) =>
        setErrorCarga(e instanceof Error ? e.message : "Error de conexión"),
      )
      .finally(() => setCargando(false));
  };

  const irAlFormulario = () => {
    setFormVisible(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      nombreRef.current?.focus({ preventScroll: true });
    });
  };

  const nuevoServicio = () => {
    setEditando(null);
    setFormDatos(FORM_VACIO);
    irAlFormulario();
  };

  const handleEditar = (s: Servicio) => {
    setEditando(s);
    setFormDatos({
      nombre: s.nombre,
      descripcion: s.descripcion ?? "",
      precio: String(s.precio),
      duracion_min: String(s.duracion_min),
    });
    irAlFormulario();
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setFormDatos(FORM_VACIO);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltro("todos");
    setOrden("nombre");
  };

  // ---------- derivados ----------
  const activos = servicios.filter((s) => s.activo).length;
  const inactivos = servicios.length - activos;

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = servicios.filter((s) => {
      const texto = `${s.nombre} ${s.descripcion ?? ""}`.toLowerCase();
      const coincide = q === "" || texto.includes(q);
      const estado =
        filtro === "todos" || (filtro === "activos" ? s.activo : !s.activo);
      return coincide && estado;
    });
    return [...lista].sort((a, b) => {
      if (orden === "precio-asc") return a.precio - b.precio;
      if (orden === "precio-desc") return b.precio - a.precio;
      if (orden === "duracion") return a.duracion_min - b.duracion_min;
      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [servicios, busqueda, filtro, orden]);

  const precioNum = Number(formDatos.precio);
  const duracionNum = Number(formDatos.duracion_min);
  const formValido =
    formDatos.nombre.trim().length >= 2 &&
    formDatos.precio !== "" &&
    Number.isFinite(precioNum) &&
    precioNum >= 0 &&
    Number.isFinite(duracionNum) &&
    duracionNum >= 5;

  // ---------- mutaciones ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValido || guardando) return;

    setGuardando(true);
    const payload = {
      nombre: formDatos.nombre.trim(),
      descripcion: formDatos.descripcion.trim(),
      precio: precioNum,
      duracion_min: duracionNum,
    };
    const eraEdicion = Boolean(editando);

    try {
      const res = await fetch(API, {
        method: eraEdicion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          eraEdicion
            ? { id: editando?.id, ...payload }
            : { estudio_id: ESTUDIO_ID, ...payload, activo: true },
        ),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.mensaje || "No se pudo guardar");

      setEditando(null);
      setFormDatos(FORM_VACIO);
      await recargar();
      mostrarToast({
        tipo: "ok",
        texto: eraEdicion
          ? `"${payload.nombre}" actualizado`
          : `"${payload.nombre}" creado`,
      });
    } catch (err: unknown) {
      mostrarToast({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error de conexión",
      });
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (s: Servicio) => {
    if (busyId) return;
    const nuevo = !s.activo;
    setBusyId(s.id);
    setServicios((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, activo: nuevo } : x)),
    );
    try {
      const res = await fetch(API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, activo: nuevo }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.mensaje || "No se pudo cambiar el estado");
      mostrarToast({
        tipo: "ok",
        texto: nuevo ? `"${s.nombre}" activado` : `"${s.nombre}" desactivado`,
      });
    } catch (err: unknown) {
      setServicios((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, activo: s.activo } : x)),
      );
      mostrarToast({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error de conexión",
      });
    } finally {
      setBusyId(null);
    }
  };

  const restaurar = async (s: Servicio) => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estudio_id: ESTUDIO_ID,
          nombre: s.nombre,
          descripcion: s.descripcion ?? "",
          precio: s.precio,
          duracion_min: s.duracion_min,
          activo: s.activo,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.mensaje || "No se pudo restaurar");
      await recargar();
      mostrarToast({ tipo: "ok", texto: `"${s.nombre}" restaurado` });
    } catch (err: unknown) {
      mostrarToast({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error de conexión",
      });
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar || eliminando) return;
    const s = aEliminar;
    setEliminando(true);
    try {
      const res = await fetch(`${API}?id=${s.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.mensaje || "No se pudo eliminar");

      setServicios((prev) => prev.filter((x) => x.id !== s.id));
      if (editando?.id === s.id) cancelarEdicion();
      setAEliminar(null);
      mostrarToast({
        tipo: "info",
        texto: `"${s.nombre}" eliminado`,
        deshacer: () => void restaurar(s),
      });
    } catch (err: unknown) {
      mostrarToast({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error de conexión",
      });
    } finally {
      setEliminando(false);
    }
  };

  // ---------- tema ----------
  const bg = modoOscuro ? "bg-gray-900" : "bg-gray-100";
  const tarjeta = modoOscuro ? "bg-gray-800" : "bg-white";
  const borde = modoOscuro ? "border-gray-700" : "border-gray-200";
  const texto = modoOscuro ? "text-gray-100" : "text-gray-800";
  const texto2 = modoOscuro ? "text-gray-400" : "text-gray-600";
  const suave = modoOscuro ? "bg-gray-700/40" : "bg-gray-50";
  const divisor = modoOscuro ? "divide-gray-700" : "divide-gray-100";
  const filaHover = modoOscuro ? "hover:bg-gray-700/40" : "hover:bg-gray-50";
  const input = modoOscuro
    ? "bg-gray-900/60 border-gray-600 text-gray-100 placeholder-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  const btnPrimario =
    "bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-[.99]";

  const tarjetasFiltro = [
    { key: "todos" as const, label: "Total", valor: servicios.length, acento: "from-pink-500 to-fuchsia-600" },
    { key: "activos" as const, label: "Activos", valor: activos, acento: "from-emerald-500 to-teal-600" },
    { key: "inactivos" as const, label: "Inactivos", valor: inactivos, acento: "from-amber-500 to-orange-600" },
  ];

  const badge = (activo: boolean) =>
    activo
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30"
      : modoOscuro
        ? "bg-gray-600/40 text-gray-300 ring-1 ring-gray-500/40"
        : "bg-gray-200 text-gray-600 ring-1 ring-gray-300";

  return (
    <div className={`min-h-screen ${bg} ${texto} transition-colors duration-300`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="mx-auto max-w-5xl px-3 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-8">
        {/* ================= HEADER ================= */}
        <header className={`${tarjeta} mb-4 rounded-2xl border ${borde} p-4 shadow-sm sm:mb-6 sm:p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-xl shadow-lg shadow-pink-500/25">
                💅
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold sm:text-2xl">Gestión de Servicios</h1>
                <p className={`truncate text-xs sm:text-sm ${texto2}`}>
                  Agregá, editá o eliminá los servicios
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModoOscuro(!modoOscuro)}
              aria-label={modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg transition-all ${
                modoOscuro
                  ? "bg-amber-400 text-gray-900 hover:bg-amber-300"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              {modoOscuro ? "☀️" : "🌙"}
            </button>
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/admin/reservas"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 px-3 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/10"
            >
              📋 Reservas
            </Link>
            <Link
              href="/admin/configuracion"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-fuchsia-500 px-3 text-sm font-semibold text-fuchsia-600 transition-colors hover:bg-fuchsia-500/10"
            >
              🎨 Personalización
            </Link>
            <Link
              href="/"
              className={`col-span-2 flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors sm:col-span-1 ${
                modoOscuro ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ← Inicio
            </Link>
          </nav>
        </header>

        {/* ================= CONTADORES / FILTRO ================= */}
        <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
          {tarjetasFiltro.map((c) => {
            const sel = filtro === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setFiltro(c.key)}
                aria-pressed={sel}
                className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${tarjeta} ${
                  sel ? "border-pink-500 ring-2 ring-pink-500/30" : borde
                }`}
              >
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.acento}`} />
                <p className={`text-[11px] uppercase tracking-wide ${texto2}`}>{c.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{c.valor}</p>
              </button>
            );
          })}
        </div>

        {/* ================= FORMULARIO ================= */}
        <section
          ref={formRef}
          className={`${tarjeta} mb-4 scroll-mt-4 overflow-hidden rounded-2xl border ${borde} shadow-sm sm:mb-6`}
        >
          <div className={`flex items-center justify-between gap-3 p-4 sm:p-5 ${editando ? "bg-gradient-to-r from-blue-500/10 to-transparent" : ""}`}>
            <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
              <span>{editando ? "✏️" : "➕"}</span>
              {editando ? "Editar servicio" : "Nuevo servicio"}
            </h2>
            <button
              type="button"
              onClick={() => setFormVisible((v) => !v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors md:hidden ${suave} ${texto2}`}
            >
              {formVisible ? "Ocultar ▲" : "Mostrar ▼"}
            </button>
          </div>

          {formVisible && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 px-4 pb-4 sm:grid-cols-2 sm:px-5 sm:pb-5">
              <div className="sm:col-span-2">
                <label htmlFor="svc-nombre" className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${texto2}`}>
                  Nombre del servicio
                </label>
                <input
                  id="svc-nombre"
                  ref={nombreRef}
                  type="text"
                  value={formDatos.nombre}
                  onChange={(e) => setFormDatos({ ...formDatos, nombre: e.target.value })}
                  placeholder="Ej: Manicura semipermanente"
                  maxLength={80}
                  className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${input}`}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="svc-desc" className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${texto2}`}>
                  Descripción breve
                </label>
                <input
                  id="svc-desc"
                  type="text"
                  value={formDatos.descripcion}
                  onChange={(e) => setFormDatos({ ...formDatos, descripcion: e.target.value })}
                  placeholder="Ej: Incluye limado, cutícula y esmaltado"
                  maxLength={140}
                  className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${input}`}
                />
              </div>

              <div>
                <label htmlFor="svc-precio" className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${texto2}`}>
                  Precio
                </label>
                <div className="relative">
                  <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${texto2}`}>$</span>
                  <input
                    id="svc-precio"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={formDatos.precio}
                    onChange={(e) => setFormDatos({ ...formDatos, precio: e.target.value })}
                    placeholder="0"
                    className={`h-12 w-full rounded-xl border pl-8 pr-4 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${input}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="svc-duracion" className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${texto2}`}>
                  Duración (minutos)
                </label>
                <input
                  id="svc-duracion"
                  type="number"
                  inputMode="numeric"
                  min={5}
                  step={5}
                  value={formDatos.duracion_min}
                  onChange={(e) => setFormDatos({ ...formDatos, duracion_min: e.target.value })}
                  className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${input}`}
                />
              </div>

              <div className="svc-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:col-span-2">
                {DURACIONES.map((d) => {
                  const sel = Number(formDatos.duracion_min) === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormDatos({ ...formDatos, duracion_min: String(d) })}
                      className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all ${
                        sel
                          ? "border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-500/25"
                          : `${borde} ${suave} ${texto2}`
                      }`}
                    >
                      {duracionTexto(d)}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={!formValido || guardando}
                  className={`h-12 flex-1 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ${btnPrimario}`}
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                      ? "💾 Actualizar servicio"
                      : "💾 Guardar servicio"}
                </button>
                {editando && (
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className={`h-12 rounded-xl px-6 text-sm font-bold transition-colors sm:w-auto ${
                      modoOscuro ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {!formValido && formDatos.nombre.length > 0 && (
                <p className="text-xs font-medium text-amber-500 sm:col-span-2">
                  Completá un nombre de al menos 2 caracteres, un precio válido y una duración de 5 minutos o más.
                </p>
              )}
            </form>
          )}
        </section>

        {/* ================= BUSCADOR + ORDEN ================= */}
        <div className={`${tarjeta} mb-3 rounded-2xl border ${borde} p-3 shadow-sm sm:mb-4 sm:p-4`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                aria-label="Buscar servicios"
                className={`h-11 w-full rounded-xl border pl-9 pr-9 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${input}`}
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  aria-label="Limpiar búsqueda"
                  className={`absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-xs ${suave} ${texto2}`}
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              aria-label="Ordenar servicios"
              className={`h-11 rounded-xl border px-3 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/25 ${input}`}
            >
              <option value="nombre">Nombre (A–Z)</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="duracion">Duración: menor a mayor</option>
            </select>
          </div>

          {(busqueda !== "" || filtro !== "todos") && (
            <p className={`mt-2 text-xs ${texto2}`}>
              Mostrando <strong className={texto}>{visibles.length}</strong> de {servicios.length} servicios ·{" "}
              <button type="button" onClick={limpiarFiltros} className="font-semibold text-pink-500 underline underline-offset-2">
                Limpiar filtros
              </button>
            </p>
          )}
        </div>

        {/* ================= LISTA ================= */}
        {cargando ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`${tarjeta} h-32 animate-pulse rounded-2xl border ${borde}`} />
            ))}
          </div>
        ) : errorCarga ? (
          <div className={`${tarjeta} rounded-2xl border ${borde} p-8 text-center shadow-sm`}>
            <p className="text-3xl">⚠️</p>
            <p className="mt-2 font-semibold">{errorCarga}</p>
            <button type="button" onClick={reintentar} className={`mt-4 h-11 rounded-xl px-6 text-sm font-bold ${btnPrimario}`}>
              Reintentar
            </button>
          </div>
        ) : servicios.length === 0 ? (
          <div className={`${tarjeta} rounded-2xl border ${borde} p-10 text-center shadow-sm`}>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-pink-500/15 to-fuchsia-600/15 text-3xl">💅</div>
            <p className="mt-4 text-lg font-bold">Todavía no cargaste servicios</p>
            <p className={`mt-1 text-sm ${texto2}`}>Creá el primero y va a aparecer en la página de reservas.</p>
            <button type="button" onClick={nuevoServicio} className={`mt-5 h-12 rounded-xl px-6 text-sm font-bold ${btnPrimario}`}>
              ➕ Crear mi primer servicio
            </button>
          </div>
        ) : visibles.length === 0 ? (
          <div className={`${tarjeta} rounded-2xl border ${borde} p-10 text-center shadow-sm`}>
            <p className="text-3xl">🔍</p>
            <p className="mt-3 font-bold">Sin resultados</p>
            <p className={`mt-1 text-sm ${texto2}`}>Ningún servicio coincide con la búsqueda o el filtro elegido.</p>
            <button type="button" onClick={limpiarFiltros} className={`mt-5 h-11 rounded-xl px-6 text-sm font-bold ${btnPrimario}`}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* ---------- Desktop: tabla ---------- */}
            <div className={`${tarjeta} svc-scroll hidden overflow-x-auto rounded-2xl border ${borde} shadow-sm md:block`}>
              <table className="w-full">
                <thead className={suave}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${texto2}`}>Servicio</th>
                    <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${texto2}`}>Duración</th>
                    <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${texto2}`}>Precio</th>
                    <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${texto2}`}>Estado</th>
                    <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${texto2}`}>Acciones</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${divisor}`}>
                  {visibles.map((s) => (
                    <tr key={s.id} className={`transition-colors ${filaHover} ${busyId === s.id ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{s.nombre}</div>
                        {s.descripcion && <div className={`mt-0.5 text-xs ${texto2}`}>{s.descripcion}</div>}
                      </td>
                      <td className={`px-4 py-3 text-sm ${texto2}`}>{duracionTexto(s.duracion_min)}</td>
                      <td className="px-4 py-3 text-sm font-bold tabular-nums">{money(s.precio)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(s.activo)}`}>
                          {s.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditar(s)}
                            className="rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-500 transition-colors hover:bg-blue-500/25"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            disabled={busyId === s.id}
                            onClick={() => toggleActivo(s)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                              s.activo
                                ? "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25"
                                : "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                            }`}
                          >
                            {s.activo ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAEliminar(s)}
                            className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/25"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ---------- Mobile: tarjetas ---------- */}
            <div className="space-y-3 md:hidden">
              {visibles.map((s) => (
                <article
                  key={s.id}
                  className={`svc-in overflow-hidden rounded-2xl border ${borde} ${tarjeta} shadow-sm transition-opacity ${busyId === s.id ? "opacity-60" : ""}`}
                >
                  <div className={`h-1 w-full bg-gradient-to-r ${s.activo ? "from-emerald-400 to-teal-500" : "from-gray-400 to-gray-500"}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold leading-tight">{s.nombre}</h3>
                        {s.descripcion && (
                          <p className={`mt-1 line-clamp-2 text-xs leading-snug ${texto2}`}>{s.descripcion}</p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(s.activo)}`}>
                        {s.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${suave} ${texto2}`}>
                        ⏱ {duracionTexto(s.duracion_min)}
                      </span>
                      <span className="rounded-lg bg-gradient-to-r from-pink-500/15 to-fuchsia-600/15 px-2.5 py-1.5 text-sm font-bold tabular-nums text-pink-500">
                        {money(s.precio)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditar(s)}
                        className="flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl bg-blue-500/15 text-blue-500 transition-colors active:bg-blue-500/30"
                      >
                        <span className="text-base leading-none">✏️</span>
                        <span className="text-[11px] font-bold">Editar</span>
                      </button>
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => toggleActivo(s)}
                        className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl transition-colors disabled:opacity-50 ${
                          s.activo
                            ? "bg-amber-500/15 text-amber-600 active:bg-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-600 active:bg-emerald-500/30"
                        }`}
                      >
                        <span className="text-base leading-none">{s.activo ? "⏸️" : "▶️"}</span>
                        <span className="text-[11px] font-bold">{s.activo ? "Desactivar" : "Activar"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAEliminar(s)}
                        className="flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl bg-red-500/15 text-red-500 transition-colors active:bg-red-500/30"
                      >
                        <span className="text-base leading-none">🗑️</span>
                        <span className="text-[11px] font-bold">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ================= FAB MOBILE ================= */}
      <button
        type="button"
        onClick={nuevoServicio}
        aria-label="Agregar nuevo servicio"
        className={`fixed bottom-5 right-4 z-40 grid h-14 w-14 place-items-center rounded-full text-2xl md:hidden ${btnPrimario}`}
      >
        ＋
      </button>

      {/* ================= MODAL ELIMINAR ================= */}
      {aEliminar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !eliminando && setAEliminar(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar"
            className={`svc-sheet relative w-full rounded-t-3xl border ${borde} ${tarjeta} p-5 shadow-2xl sm:max-w-md sm:rounded-2xl`}
          >
            <div className={`mx-auto mb-4 h-1.5 w-12 rounded-full sm:hidden ${modoOscuro ? "bg-gray-600" : "bg-gray-300"}`} />
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-500/15 text-xl">🗑️</span>
              <div className="min-w-0">
                <h3 id="titulo-eliminar" className="text-lg font-bold">¿Eliminar servicio?</h3>
                <p className={`mt-1 text-sm ${texto2}`}>
                  Vas a eliminar <strong className={texto}>&ldquo;{aEliminar.nombre}&rdquo;</strong> ({duracionTexto(aEliminar.duracion_min)} · {money(aEliminar.precio)}).
                  Dejará de aparecer en la página de reservas.
                </p>
              </div>
            </div>

            <div className={`mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-medium text-amber-600`}>
              Vas a poder deshacer esta acción desde el aviso que aparece abajo.
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                disabled={eliminando}
                onClick={() => setAEliminar(null)}
                className={`h-12 flex-1 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
                  modoOscuro ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={eliminando}
                onClick={confirmarEliminar}
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}
      {toast && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-3 sm:bottom-6 sm:top-auto"
        >
          <div
            className={`svc-toast pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${
              toast.tipo === "ok"
                ? "border-emerald-500/40 bg-emerald-600 text-white"
                : toast.tipo === "error"
                  ? "border-red-500/40 bg-red-600 text-white"
                  : modoOscuro
                    ? "border-gray-600 bg-gray-800 text-gray-100"
                    : "border-gray-300 bg-gray-900 text-white"
            }`}
          >
            <span className="text-lg leading-none">
              {toast.tipo === "ok" ? "✅" : toast.tipo === "error" ? "⚠️" : "🗑️"}
            </span>
            <p className="flex-1 text-sm font-semibold">{toast.texto}</p>
            {toast.deshacer && (
              <button
                type="button"
                onClick={() => {
                  toast.deshacer?.();
                  setToast(null);
                }}
                className="shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-white/30"
              >
                Deshacer
              </button>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Cerrar aviso"
              className="shrink-0 rounded-lg px-1.5 text-sm opacity-70 transition-opacity hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}