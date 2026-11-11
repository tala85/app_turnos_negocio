import { ESTUDIO_ID } from "@/features/servicios/types";

const API = "/api/admin/combos";
const JSON_HEADERS = { "Content-Type": "application/json" };

type ComboPayload = {
  nombre: string;
  descripcion: string;
  precio_oferta: number;
  servicio_ids: string[];
};

type Combo = {
  id: string;
  estudio_id: string;
  nombre: string;
  descripcion: string | null;
  precio_oferta: number;
  activo: boolean;
  combo_servicios: { servicio_id: string }[];
};

async function leer(res: Response) {
  const data = await res.json();
  if (!data.ok) throw new Error(data.mensaje || "Error en el servidor");
  return data;
}

export const combosApi = {
  async listar(): Promise<Combo[]> {
    const res = await fetch(`${API}?estudioId=${ESTUDIO_ID}`, { cache: "no-store" });
    const data = await leer(res);
    return (data.data ?? []) as Combo[];
  },

  async crear(payload: ComboPayload): Promise<void> {
    const res = await fetch(API, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ estudio_id: ESTUDIO_ID, ...payload, activo: true }),
    });
    await leer(res);
  },

  async actualizar(id: string, cambios: Partial<ComboPayload> & { activo?: boolean }): Promise<void> {
    const res = await fetch(API, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify({ id, ...cambios }),
    });
    await leer(res);
  },

  async eliminar(id: string): Promise<void> {
    const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
    await leer(res);
  },
};