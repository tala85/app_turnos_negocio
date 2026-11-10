import { NextResponse } from 'next/server';
import { calcularReserva } from '@/lib/turnos/precios';

export async function GET() {
  try {
    const resultado = await calcularReserva(
      '2441c401-ae11-4037-ab80-4725c0304840',
      [
        '083336ea-f643-481b-b6a4-6991d6da2c1f',
        '1feabd82-cf9c-4405-abd3-75e2b0f00492',
      ],
      []
    );

    return NextResponse.json({
      ok: true,
      items: resultado.items,
      total: resultado.total,
      minutos: resultado.minutos,
      sena: resultado.sena,
      requiereSena: resultado.requiereSena,
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json(
      { ok: false, error: mensaje },  // ✅ usamos 'mensaje', no 'e.message'
      { status: 400 }
    );
  }
}