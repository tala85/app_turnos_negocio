"use client";

import { useEffect, useState } from "react";

type Config = {
  slogan_default: string; color_primario: string; color_secundario: string; color_fondo: string;
  sena_porcentaje: number; minutos_bloqueo: number; paso_minutos: number;
  horario_inicio: string; horario_fin: string; dias_atencion: number[];
};

const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export default function SuperAdminConfiguracion() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/super-admin/configuracion").then(r => r.json()).then(d => { if (d.ok) setCfg(d.data); });
  }, []);

  const toggleDia = (d: number) => {
    if (!cfg) return;
    const arr = cfg.dias_atencion.includes(d) ? cfg.dias_atencion.filter(x => x !== d) : [...cfg.dias_atencion, d];
    setCfg({ ...cfg, dias_atencion: arr });
  };

  const guardar = async () => {
    if (!cfg) return;
    setGuardando(true); setMsg("");
    const res = await fetch("/api/super-admin/configuracion", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg),
    });
    const data = await res.json();
    setMsg(data.ok ? "✅ Guardado" : "❌ " + (data.mensaje || "Error"));
    setGuardando(false);
  };

  if (!cfg) return <div className="p-10 text-gray-400">Cargando…</div>;

  const input = "w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white outline-none focus:border-violet-500";

  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-1">Configuración de plataforma</h1>
      <p className="text-gray-400 mb-8">Defaults con los que nace cada estudio nuevo al registrarse</p>

      <div className="space-y-6">
        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-white">🎨 Identidad por defecto</h2>
          <div><label className="text-xs text-gray-400 uppercase">Slogan</label>
            <input className={input} value={cfg.slogan_default} onChange={e => setCfg({ ...cfg, slogan_default: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3">
            {(["color_primario","color_secundario","color_fondo"] as const).map(k => (
              <div key={k}>
                <label className="text-xs text-gray-400 uppercase block mb-1">{k.replace("color_","")}</label>
                <input type="color" value={cfg[k]} onChange={e => setCfg({ ...cfg, [k]: e.target.value })} className="h-10 w-full rounded-lg bg-transparent cursor-pointer" />
                <p className="text-gray-500 text-xs mt-1">{cfg[k]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-white">⏰ Horario por defecto</h2>
          <div className="flex gap-3 flex-wrap">
            {DIAS.map((d, i) => (
              <button key={i} type="button" onClick={() => toggleDia(i)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${cfg.dias_atencion.includes(i) ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400"}`}>{d}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400 uppercase">Inicio</label>
              <input type="time" className={input} value={cfg.horario_inicio} onChange={e => setCfg({ ...cfg, horario_inicio: e.target.value })} /></div>
            <div><label className="text-xs text-gray-400 uppercase">Fin</label>
              <input type="time" className={input} value={cfg.horario_fin} onChange={e => setCfg({ ...cfg, horario_fin: e.target.value })} /></div>
          </div>
        </section>

        <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6 grid grid-cols-3 gap-3">
          <h2 className="col-span-3 font-semibold text-white">💰 Reglas de seña</h2>
          <div><label className="text-xs text-gray-400 uppercase">Seña %</label>
            <input type="number" className={input} value={cfg.sena_porcentaje} onChange={e => setCfg({ ...cfg, sena_porcentaje: Number(e.target.value) })} /></div>
          <div><label className="text-xs text-gray-400 uppercase">Bloqueo (min)</label>
            <input type="number" className={input} value={cfg.minutos_bloqueo} onChange={e => setCfg({ ...cfg, minutos_bloqueo: Number(e.target.value) })} /></div>
          <div><label className="text-xs text-gray-400 uppercase">Paso (min)</label>
            <input type="number" className={input} value={cfg.paso_minutos} onChange={e => setCfg({ ...cfg, paso_minutos: Number(e.target.value) })} /></div>
        </section>

        <div className="flex items-center gap-4">
          <button onClick={guardar} disabled={guardando} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-rose-500 text-white font-semibold rounded-lg disabled:opacity-50">
            {guardando ? "Guardando…" : "💾 Guardar defaults"}
          </button>
          {msg && <span className="text-sm text-gray-300">{msg}</span>}
        </div>
      </div>
    </div>
  );
}