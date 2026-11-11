export type Servicio = {
  id: string;
  estudio_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_min: number;
  activo: boolean;
};

export type ServicioPayload = {
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_min: number;
};

export type FormDatos = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion_min: string;
};

export type Filtro = "todos" | "activos" | "inactivos";
export type Orden = "nombre" | "precio-asc" | "precio-desc" | "duracion";

export const ESTUDIO_ID = "2441c401-ae11-4037-ab80-4725c0304840";
export const DURACIONES = [15, 20, 30, 45, 60, 90, 120];

export const FORM_VACIO: FormDatos = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_min: "30",
};