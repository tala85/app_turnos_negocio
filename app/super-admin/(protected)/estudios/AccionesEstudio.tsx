"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  estudioId: string;
  nombre: string;
};

export default function AccionesEstudio({ estudioId, nombre }: Props) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  // Estados para el modal de acceso urgente
  const [modalAbierto, setModalAbierto] = useState(false);
  const [linkGenerado, setLinkGenerado] = useState("");
  const [emailDestino, setEmailDestino] = useState("");

  const impersonar = async () => {
    if (
      !confirm(
        `¿Entrar al panel de "${nombre}" como soporte?\n\n` +
          `Vas a ver SUS datos. La sesión dura 30 min. ` +
          `Para volver, cerrá sesión desde el panel del estudio.`,
      )
    )
      return;

    setCargando(true);
    try {
      const res = await fetch("/api/super-admin/impersonar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estudioId }),
      });

      const data = await res.json();
      if (data.ok) {
        router.push("/admin/reservas");
      } else {
        alert(data.mensaje || "Error al impersonar");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const generarAccesoUrgente = async () => {
    setCargando(true);
    try {
      const res = await fetch(
        `/api/super-admin/estudios/${estudioId}/acceso-urgente`,
        {
          method: "POST",
        },
      );
      const data = await res.json();

      if (data.ok) {
        setLinkGenerado(data.link);
        setEmailDestino(data.email || "No registrado");
        setModalAbierto(true);
      } else {
        alert(data.mensaje || "Error al generar el enlace");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(linkGenerado);
    alert("¡Enlace copiado! Envíaselo por WhatsApp al dueño.");
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={generarAccesoUrgente}
          disabled={cargando}
          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
          title="Generar enlace de acceso de 15 minutos"
        >
          🔑 Acceso
        </button>
        <button
          onClick={impersonar}
          disabled={cargando}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          👀 Ver panel
        </button>
      </div>

      {/* Modal de Acceso Urgente */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">
              🔑 Enlace de acceso urgente
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Este enlace es válido por{" "}
              <strong className="text-amber-400">15 minutos</strong> y es de un
              solo uso.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4">
              <p className="text-xs text-slate-500 mb-1">
                Destino del email (si estuviera configurado):
              </p>
              <p className="text-sm text-slate-300 font-mono break-all">
                {emailDestino}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-6 relative group">
              <p className="text-xs text-slate-500 mb-1">Enlace para copiar:</p>
              <p className="text-xs text-amber-400 font-mono break-all pr-8">
                {linkGenerado}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copiarAlPortapapeles}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                📋 Copiar enlace
              </button>
              <button
                onClick={() => setModalAbierto(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
