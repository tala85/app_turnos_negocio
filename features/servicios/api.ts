import { ESTUDIO_ID, type Servicio, type ServicioPayload } from "./types";

const API = "/api/admin/servicios";
const JSON_HEADERS = { "Content-Type": "application/json" };

async function leer(res: Response) {
  const data = await res.json();
  if (!data.ok) throw new Error(data.mensaje || "Error en el servidor");
  return data;
}

export const serviciosApi = {
  async listar(): Promise<Servicio[]> {
    const res = await fetch(`${API}?estudioId=${ESTUDIO_ID}`, { cache: "no-store" });
    const data = await leer(res);
    return (data.data ?? []) as Servicio[];
  },

  async crear(payload: ServicioPayload, activo = true): Promise<void> {
    const res = await fetch(API, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ estudio_id: ESTUDIO_ID, activo, ...payload }),
    });
    await leer(res);
  },

  async actualizar(
    id: string,
    cambios: Partial<ServicioPayload> & { activo?: boolean },
  ): Promise<void> {
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