import { describe, it, expect, vi, beforeEach } from "vitest";

// 1. Declarar los mocks PRIMERO
const mockFrom = vi.fn();
const mockObtenerEstudioDeSesion = vi.fn();

// 2. Configurar los mocks de los módulos
vi.mock("@/lib/supabase/admin", () => ({
  adminDb: { from: mockFrom },
}));

vi.mock("@/lib/auth", () => ({
  obtenerEstudioDeSesion: mockObtenerEstudioDeSesion,
}));

// ✅ Helper definitivo para cadenas fluidas de Supabase
function crearMockChain(resultado: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(resultado),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resultado),
  };
}

describe("reservas/bloqueo: aislamiento de tenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("❌ rechaza turnos que no pertenecen al estudio de la sesión", async () => {
    mockObtenerEstudioDeSesion.mockResolvedValue("estudio-A-id");

    // 1ª llamada a from("turnos") → devuelve data vacía (turnos de otro estudio)
    mockFrom.mockReturnValueOnce(crearMockChain({ data: [], error: null }));

    const { POST } = await import("../app/api/reservas/bloqueo/route");

    const req = new Request("http://localhost/api/reservas/bloqueo", {
      method: "POST",
      body: JSON.stringify({
        estudioId: "estudio-A-id",
        turnoIds: ["turno-ajeno-1"],
        servicioIds: ["servicio-1"],
        cliente: {
          nombre: "Test",
          apellido: "Test",
          dni: "123",
          telefono: "123",
        },
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.mensaje).toContain("inválidos o no pertenecen");
  });

  it("✅ permite bloquear turnos que sí pertenecen al estudio", async () => {
    mockObtenerEstudioDeSesion.mockResolvedValue("estudio-A-id");

    // 1) turnos select → encuentra 1 turno libre del estudio
    mockFrom.mockReturnValueOnce(
      crearMockChain({
        data: [{ id: "turno-1", estado: "libre" }],
        error: null,
      }),
    );
    // 2) servicios select → 1 servicio de $1000
    mockFrom.mockReturnValueOnce(
      crearMockChain({
        data: [{ id: "servicio-1", precio: 1000, duracion_min: 60 }],
        error: null,
      }),
    );
    // 3) combos select → 1 combo de $1500 (AHORA SÍ SE USA porque mandamos comboIds)
    mockFrom.mockReturnValueOnce(
      crearMockChain({
        data: [{ id: "combo-1", precio_oferta: 1500 }],
        error: null,
      }),
    );
    // 4) turnos update (bloquear) → ok
    mockFrom.mockReturnValueOnce(crearMockChain({ data: null, error: null }));
    // 5) reservas insert → devuelve la reserva creada
    mockFrom.mockReturnValueOnce(
      crearMockChain({
        data: { id: "reserva-123" },
        error: null,
      }),
    );

    const { POST } = await import("../app/api/reservas/bloqueo/route");

    const req = new Request("http://localhost/api/reservas/bloqueo", {
      method: "POST",
      body: JSON.stringify({
        estudioId: "estudio-A-id",
        turnoIds: ["turno-1"],
        servicioIds: ["servicio-1"],
        comboIds: ["combo-1"], // ← AGREGADO para que from('combos') se ejecute
        cliente: {
          nombre: "Test",
          apellido: "Test",
          dni: "123",
          telefono: "123",
        },
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.reservaId).toBe("reserva-123");
    // Bonus: el total debe ser $1000 (servicio) + $1500 (combo) = $2500
    expect(data.total).toBe(2500);
  });
});
