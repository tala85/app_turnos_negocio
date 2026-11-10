import 'server-only';
import { adminDb } from '@/lib/supabase/admin';
import type { ItemReserva } from '@/lib/types';

export type CalculoReserva = {
  items: ItemReserva[];
  total: number;
  minutos: number;
  sena: number;
  requiereSena: boolean;
  minutosBloqueo: number;
};

// Tipo para los servicios que vienen de la BD (tienen id)
type ServicioDB = {
  id: string;
  nombre: string;
  precio: number;
  duracion_min: number;
};

export async function calcularReserva(
  estudioId: string,
  servicioIds: string[],
  comboIds: string[]
): Promise<CalculoReserva> {
  const [{ data: estudio }, { data: servicios }, { data: combos }] =
    await Promise.all([
      adminDb
        .from('estudios')
        .select('requiere_sena, sena_porcentaje, minutos_bloqueo')
        .eq('id', estudioId)
        .single(),
      adminDb
        .from('servicios')
        .select('id, nombre, precio, duracion_min')
        .eq('estudio_id', estudioId)
        .eq('activo', true),
      adminDb
        .from('combos')
        .select('id, nombre, precio_oferta, combo_servicios(servicio_id)')
        .eq('estudio_id', estudioId)
        .eq('activo', true),
    ]);

  if (!estudio) throw new Error('Estudio inexistente');
  if (!servicioIds.length && !comboIds.length) {
    throw new Error('Elegí al menos un servicio');
  }

  // ✅ Solución Error 1: tipo explícito en lugar de (typeof servicios)[0]
  const listaServicios: ServicioDB[] = servicios ?? [];
  const mapa = new Map<string, ServicioDB>(
    listaServicios.map((s) => [s.id, s])
  );

  const items: ItemReserva[] = [];
  const usados = new Set<string>();
  let total = 0;

  for (const id of servicioIds) {
    const s = mapa.get(id);
    if (!s) throw new Error('Servicio inválido');
    items.push({
      id: s.id,
      nombre: s.nombre,
      precio: Number(s.precio),
      duracion_min: s.duracion_min,
    });
    usados.add(s.id);
    total += Number(s.precio);
  }

  for (const id of comboIds) {
    const c = (combos ?? []).find((x) => x.id === id);
    if (!c) throw new Error('Combo inválido');

    const incluidos: ItemReserva[] = c.combo_servicios
      .map((r: { servicio_id: string }) => {
        const s = mapa.get(r.servicio_id);
        if (!s) return null;
        return {
          id: s.id,
          nombre: s.nombre,
          precio: Number(s.precio),
          duracion_min: s.duracion_min,
        };
      })
      .filter((s): s is ItemReserva => s !== null);

    incluidos.forEach((s) => usados.add(s.id));

    items.push({
      id: `combo-${c.id}`,
      nombre: `Combo: ${c.nombre}`,
      precio: Number(c.precio_oferta),
      duracion_min: incluidos.reduce((a, s) => a + s.duracion_min, 0),
    });
    total += Number(c.precio_oferta);
  }

  const minutos = [...usados].reduce(
    (a, id) => a + (mapa.get(id)?.duracion_min ?? 0),
    0
  );

  const sena = estudio.requiere_sena
    ? Math.round((total * Number(estudio.sena_porcentaje)) / 100)
    : 0;

  return {
    items,
    total,
    minutos,
    sena,
    requiereSena: estudio.requiere_sena,
    minutosBloqueo: estudio.minutos_bloqueo,
  };
}