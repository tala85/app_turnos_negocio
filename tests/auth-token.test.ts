import { describe, it, expect, beforeEach } from "vitest";
import { generarToken, verificarToken } from "../lib/auth-token";

describe("auth-token: seguridad del sistema de tokens", () => {
  // Simulamos el ADMIN_SECRET para los tests
  const SECRET_TEST = "test-secret-key-12345";

  beforeEach(() => {
    // Inyectamos la variable de entorno para cada test
    process.env.ADMIN_SECRET = SECRET_TEST;
  });

  it("✅ genera un token válido y lo verifica correctamente", async () => {
    const estudioId = "test-estudio-123";
    const token = await generarToken(estudioId);

    // El token debe tener formato "payload.firma"
    expect(token).toContain(".");
    const [payload, firma] = token.split(".");
    expect(payload).toBeTruthy();
    expect(firma).toBeTruthy();

    // La verificación debe devolver el estudioId correcto
    const sesion = await verificarToken(token);
    expect(sesion).not.toBeNull();
    expect(sesion!.estudioId).toBe(estudioId);
  });

  it("❌ rechaza un token con firma adulterada", async () => {
    const estudioId = "test-estudio-123";
    const token = await generarToken(estudioId);

    // Adulteramos la firma (cambiamos el último carácter)
    const [payload, firma] = token.split(".");
    const firmaAdulterada =
      firma.slice(0, -1) + (firma.slice(-1) === "a" ? "b" : "a");
    const tokenAdulterado = `${payload}.${firmaAdulterada}`;

    // La verificación debe fallar
    const sesion = await verificarToken(tokenAdulterado);
    expect(sesion).toBeNull();
  });

  it("❌ rechaza un token con payload adulterado", async () => {
    const estudioId = "test-estudio-123";
    const token = await generarToken(estudioId);

    // Adulteramos el payload (cambiamos el estudioId)
    const [payload, firma] = token.split(".");
    const payloadDecodificado = atob(payload);
    const payloadAdulterado = btoa(
      payloadDecodificado.replace(estudioId, "otro-estudio"),
    );
    const tokenAdulterado = `${payloadAdulterado}.${firma}`;

    // La verificación debe fallar (la firma no coincide con el payload modificado)
    const sesion = await verificarToken(tokenAdulterado);
    expect(sesion).toBeNull();
  });

  it("❌ rechaza un token con fecha vencida (ayer)", async () => {
    const estudioId = "test-estudio-123";
    const token = await generarToken(estudioId);

    // Manipulamos el payload para que tenga fecha de ayer
    const [payload, firma] = token.split(".");
    const payloadDecodificado = atob(payload);
    const partes = payloadDecodificado.split("|");
    const ayer = new Date(Date.now() - 48 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const payloadVencido = btoa(`${partes[0]}|${ayer}`);
    const tokenVencido = `${payloadVencido}.${firma}`;

    // La verificación debe fallar (fecha fuera del rango hoy/ayer)
    const sesion = await verificarToken(tokenVencido);
    expect(sesion).toBeNull();
  });

  it("❌ rechaza un token undefined o vacío", async () => {
    const sesionUndefined = await verificarToken(undefined);
    expect(sesionUndefined).toBeNull();

    const sesionVacio = await verificarToken("");
    expect(sesionVacio).toBeNull();
  });

  it("❌ rechaza un token con formato inválido (sin punto)", async () => {
    const sesion = await verificarToken("token-sin-punto");
    expect(sesion).toBeNull();
  });
});
