// Valida que los slots (horarios) elegidos por el cliente sean correctos:
// 1. Que sean del mismo estudio
// 2. Que sean consecutivos (uno detrás del otro)
// 3. Que la duración total cubra el servicio elegido

type Rango = {
  inicio: string;
  fin: string;
  estudio_id: string;
};

export function validarSlots(
  slots: Rango[],
  minutos: number,
  estudioId: string
): string | null {
  // Si no hay slots, error
  if (!slots.length) return 'No seleccionaste horarios';

  // Todos deben ser del mismo estudio
  if (slots.some((s) => s.estudio_id !== estudioId)) {
    return 'Horarios inválidos';
  }

  // Ordenamos por hora de inicio
  const ord = [...slots].sort((a, b) => a.inicio.localeCompare(b.inicio));

  // Verificamos que sean consecutivos (el fin de uno = inicio del siguiente)
  for (let i = 1; i < ord.length; i++) {
    if (ord[i].inicio !== ord[i - 1].fin) {
      return 'Los horarios deben ser consecutivos';
    }
  }

  // Calculamos cuántos minutos cubren en total
  const cubierto =
    (new Date(ord[ord.length - 1].fin).getTime() -
      new Date(ord[0].inicio).getTime()) /
    60000;

  // ¿Alcanzan para el servicio?
  if (cubierto < minutos) {
    return 'Ese servicio necesita más tiempo. Seleccioná más horarios.';
  }

  // ¿El horario ya pasó?
  if (new Date(ord[0].inicio).getTime() < Date.now()) {
    return 'Ese horario ya pasó';
  }

  // Si llegó acá, todo OK (null = sin errores)
  return null;
}