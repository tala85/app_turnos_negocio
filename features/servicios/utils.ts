import type { Filtro, Orden, Servicio } from "./types";

export function money(n: number) {
  return `$${Number(n || 0).toLocaleString("es-AR")}`;
}

export function duracionTexto(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function filtrarYOrdenar(
  servicios: Servicio[],
  busqueda: string,
  filtro: Filtro,
  orden: Orden,
): Servicio[] {
  const q = busqueda.trim().toLowerCase();

  const lista = servicios.filter((s) => {
    const texto = `${s.nombre} ${s.descripcion ?? ""}`.toLowerCase();
    const coincide = q === "" || texto.includes(q);
    const estado = filtro === "todos" || (filtro === "activos" ? s.activo : !s.activo);
    return coincide && estado;
  });

  return [...lista].sort((a, b) => {
    if (orden === "precio-asc") return a.precio - b.precio;
    if (orden === "precio-desc") return b.precio - a.precio;
    if (orden === "duracion") return a.duracion_min - b.duracion_min;
    return a.nombre.localeCompare(b.nombre, "es");
  });
}