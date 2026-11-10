// Tipos que usamos en toda la app.
// Sirven para que TypeScript nos avise si nos equivocamos con los nombres.

export type EstadoTurno =
  | "libre"
  | "bloqueado"
  | "confirmado"
  | "pagado"
  | "cancelado"
  | "completado";

export type Slot = {
  id: string;
  estudio_id: string;
  inicio: string;
  fin: string;
  estado: EstadoTurno;
  libera_en_segundos: number | null;
};

export type ItemReserva = {
  id: string;
  nombre: string;
  precio: number;
  duracion_min: number;
};

export type ClienteInput = {
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
};

export type ResultadoBloqueo =
  | {
      ok: true;
      reservaId: string;
      segundos: number;
      requiereSena: boolean;
      total: number;
      sena: number;
    }
  | {
      ok: false;
      mensaje: string;
      estado?: EstadoTurno;
      liberaEnSegundos?: number;
    };

export type Servicio = {
  id: string;
  estudio_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_min: number;
  activo: boolean;
  orden: number;
};

export type Combo = {
  id: string;
  estudio_id: string;
  nombre: string;
  descripcion: string | null;
  precio_oferta: number;
  activo: boolean;
  combo_servicios?: Array<{ servicio_id: string }>;
};
