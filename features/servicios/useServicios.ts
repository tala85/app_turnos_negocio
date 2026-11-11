"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useToast } from "@/lib/admin/useToast";
import { serviciosApi } from "./api";
import { filtrarYOrdenar } from "./utils";
import {
  FORM_VACIO,
  type Filtro,
  type FormDatos,
  type Orden,
  type Servicio,
} from "./types";

const mensaje = (e: unknown) =>
  e instanceof Error ? e.message : "Error de conexión";

export function useServicios() {
  const { toast, mostrar, cerrar } = useToast();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formRef = useRef<HTMLDivElement | null>(null);
  const nombreRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let activo = true;
    serviciosApi
      .listar()
      .then((lista) => {
        if (!activo) return;
        setServicios(lista);
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
      setServicios(await serviciosApi.listar());
      setError(null);
    } catch (e: unknown) {
      mostrar({ tipo: "error", texto: mensaje(e) });
    }
  };

  const reintentar = () => {
    setCargando(true);
    setError(null);
    serviciosApi
      .listar()
      .then(setServicios)
      .catch((e: unknown) => setError(mensaje(e)))
      .finally(() => setCargando(false));
  };

  const irAlFormulario = () => {
    setFormVisible(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      nombreRef.current?.focus({ preventScroll: true });
    });
  };

  const nuevo = () => {
    setEditando(null);
    setFormDatos(FORM_VACIO);
    irAlFormulario();
  };

  const editar = (s: Servicio) => {
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

  const precioNum = Number(formDatos.precio);
  const duracionNum = Number(formDatos.duracion_min);

  const formValido =
    formDatos.nombre.trim().length >= 2 &&
    formDatos.precio !== "" &&
    Number.isFinite(precioNum) &&
    precioNum >= 0 &&
    Number.isFinite(duracionNum) &&
    duracionNum >= 5;

  const guardar = async (e: FormEvent) => {
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
      if (editando) await serviciosApi.actualizar(editando.id, payload);
      else await serviciosApi.crear(payload);

      cancelarEdicion();
      await recargar();
      mostrar({
        tipo: "ok",
        texto: eraEdicion
          ? `"${payload.nombre}" actualizado`
          : `"${payload.nombre}" creado`,
      });
    } catch (err: unknown) {
      mostrar({ tipo: "error", texto: mensaje(err) });
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (s: Servicio) => {
    if (busyId) return;
    const nuevoEstado = !s.activo;
    setBusyId(s.id);
    setServicios((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, activo: nuevoEstado } : x)),
    );

    try {
      await serviciosApi.actualizar(s.id, { activo: nuevoEstado });
      mostrar({
        tipo: "ok",
        texto: nuevoEstado
          ? `"${s.nombre}" activado`
          : `"${s.nombre}" desactivado`,
      });
    } catch (err: unknown) {
      setServicios((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, activo: s.activo } : x)),
      );
      mostrar({ tipo: "error", texto: mensaje(err) });
    } finally {
      setBusyId(null);
    }
  };

  const restaurar = async (s: Servicio) => {
    try {
      await serviciosApi.crear(
        {
          nombre: s.nombre,
          descripcion: s.descripcion ?? "",
          precio: s.precio,
          duracion_min: s.duracion_min,
        },
        s.activo,
      );
      await recargar();
      mostrar({ tipo: "ok", texto: `"${s.nombre}" restaurado` });
    } catch (err: unknown) {
      mostrar({ tipo: "error", texto: mensaje(err) });
    }
  };

  const cancelarEliminar = () => {
    if (!eliminando) setAEliminar(null);
  };

  const confirmarEliminar = async () => {
    if (!aEliminar || eliminando) return;
    const s = aEliminar;
    setEliminando(true);

    try {
      await serviciosApi.eliminar(s.id);
      setServicios((prev) => prev.filter((x) => x.id !== s.id));
      if (editando?.id === s.id) cancelarEdicion();
      setAEliminar(null);
      mostrar({
        tipo: "info",
        texto: `"${s.nombre}" eliminado`,
        deshacer: () => void restaurar(s),
      });
    } catch (err: unknown) {
      mostrar({ tipo: "error", texto: mensaje(err) });
    } finally {
      setEliminando(false);
    }
  };

  const activos = servicios.filter((s) => s.activo).length;
  const inactivos = servicios.length - activos;
  const visibles = useMemo(
    () => filtrarYOrdenar(servicios, busqueda, filtro, orden),
    [servicios, busqueda, filtro, orden],
  );

  return {
    tema: null,
    servicios,
    visibles,
    activos,
    inactivos,
    cargando,
    error,
    reintentar,

    busqueda,
    setBusqueda,
    filtro,
    setFiltro,
    orden,
    setOrden,
    limpiarFiltros,

    editando,
    formDatos,
    setFormDatos,
    formValido,
    formVisible,
    setFormVisible,
    guardando,
    guardar,
    editar,
    nuevo,
    cancelarEdicion,
    formRef,
    nombreRef,

    busyId,
    toggleActivo,
    aEliminar,
    setAEliminar,
    eliminando,
    confirmarEliminar,
    cancelarEliminar,

    toast,
    cerrarToast: cerrar,
  };
}
