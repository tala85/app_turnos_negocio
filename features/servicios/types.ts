export type Servicio = {
  id: string;
  estudio_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_min: number;
  activo: boolean;
  imagen_url: string | null;
};

export type ServicioPayload = {
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_min: number;
  imagen_url: string | null;
};

export type FormDatos = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion_min: string;
  imagen_url: string | null;
};

export type Filtro = "todos" | "activos" | "inactivos";
export type Orden = "nombre" | "precio-asc" | "precio-desc" | "duracion";

export const DURACIONES = [15, 20, 30, 45, 60, 90, 120];

export const FORM_VACIO: FormDatos = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_min: "30",
  imagen_url: "",
};
