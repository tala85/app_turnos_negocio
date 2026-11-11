import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const estudioId = searchParams.get('estudioId');

  if (!estudioId) {
    return NextResponse.json({ ok: false, mensaje: 'Falta estudioId' }, { status: 400 });
  }

  try {
    // Fecha de hoy en formato ISO (inicio y fin del día)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioHoy = hoy.toISOString();
    
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);
    const finHoyISO = finHoy.toISOString();

    // Fecha hace 7 días
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    const hace7DiasISO = hace7Dias.toISOString();

    // 1. Todas las reservas del estudio
    const { data: todasReservas } = await adminDb
      .from('reservas')
      .select('*')
      .eq('estudio_id', estudioId);

    // 2. Reservas de hoy
    const reservasHoy = (todasReservas || []).filter(r => 
      r.created_at >= inicioHoy && r.created_at <= finHoyISO
    );

    // 3. Reservas de los últimos 7 días
    const reservas7Dias = (todasReservas || []).filter(r => 
      r.created_at >= hace7DiasISO
    );

    // 4. Confirmadas de hoy
    const confirmadasHoy = reservasHoy.filter(r => r.estado === 'confirmada').length;

    // 5. Ingresos estimados (solo confirmadas y pagadas)
    const ingresosHoy = reservasHoy
      .filter(r => r.estado === 'confirmada' || r.estado === 'pagada')
      .reduce((acc, r) => acc + (r.total || 0), 0);

    // 6. Agrupar por día (últimos 7 días)
    const porDia: Record<string, number> = {};
    reservas7Dias.forEach(r => {
      const dia = new Date(r.created_at).toLocaleDateString('es-AR', { weekday: 'short' });
      porDia[dia] = (porDia[dia] || 0) + 1;
    });

    // 7. Próximos turnos de hoy (ordenados por hora)
    const turnosHoy = reservasHoy
      .filter(r => r.estado !== 'cancelada')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 5); // Solo los 5 primeros

    return NextResponse.json({
      ok: true,
      data: {
        totalReservas: (todasReservas || []).length,
        reservasHoy: reservasHoy.length,
        confirmadasHoy,
        ingresosHoy,
        tasaConfirmacion: reservasHoy.length > 0 
          ? Math.round((confirmadasHoy / reservasHoy.length) * 100) 
          : 0,
        porDia,
        turnosHoy,
      },
    });
  } catch (e: unknown) {
    const mensaje = e instanceof Error ? e.message : 'Error al obtener estadísticas';
    return NextResponse.json({ ok: false, mensaje }, { status: 500 });
  }
}