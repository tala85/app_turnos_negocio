'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useModoOscuro } from '@/hooks/useModoOscuro';

type Servicio = {
  id: string;
  estudio_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_min: number;
  activo: boolean;
};

export default function AdminServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Servicio | null>(null);
  
  const [formDatos, setFormDatos] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion_min: '30',
  });
  const { modoOscuro, setModoOscuro } = useModoOscuro();
  const ESTUDIO_ID = '2441c401-ae11-4037-ab80-4725c0304840';

  const cargarServicios = async () => {
    try {
      const res = await fetch(`/api/admin/servicios?estudioId=${ESTUDIO_ID}`);
      const data = await res.json();
      if (data.ok) setServicios(data.data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setCargando(false);
    }
  };

  useState(() => {
    cargarServicios();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = editando ? 'PATCH' : 'POST';
    const bodyData = editando 
      ? { id: editando.id, ...formDatos, precio: Number(formDatos.precio), duracion_min: Number(formDatos.duracion_min) }
      : { estudio_id: ESTUDIO_ID, ...formDatos, precio: Number(formDatos.precio), duracion_min: Number(formDatos.duracion_min) };

    const res = await fetch('/api/admin/servicios', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    const data = await res.json();
    if (data.ok) {
      alert(editando ? 'Servicio actualizado con éxito' : 'Servicio creado con éxito');
      setFormDatos({ nombre: '', descripcion: '', precio: '', duracion_min: '30' });
      setEditando(null);
      cargarServicios();
    } else {
      alert('Error: ' + data.mensaje);
    }
  };

  const handleEditar = (servicio: Servicio) => {
    setEditando(servicio);
    setFormDatos({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precio: servicio.precio.toString(),
      duracion_min: servicio.duracion_min.toString(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el servicio "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    const res = await fetch(`/api/admin/servicios?id=${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (data.ok) {
      alert('Servicio eliminado correctamente');
      cargarServicios();
    } else {
      alert('Error al eliminar: ' + data.mensaje);
    }
  };

  const toggleActivo = async (id: string, estadoActual: boolean) => {
    const res = await fetch('/api/admin/servicios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, activo: !estadoActual }),
    });

    if (res.ok) {
      cargarServicios();
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setFormDatos({ nombre: '', descripcion: '', precio: '', duracion_min: '30' });
  };

  // Clases dinámicas según el modo
const bgPrincipal = modoOscuro ? "bg-gray-900" : "bg-gray-100";
const bgTarjeta = modoOscuro ? "bg-gray-800" : "bg-white";
const textoPrincipal = modoOscuro ? "text-gray-100" : "text-gray-800";
const textoSecundario = modoOscuro ? "text-gray-400" : "text-gray-600";
const bordeTarjeta = modoOscuro ? "border-gray-700" : "border-gray-200";
const bgHeader = modoOscuro ? "bg-gray-700/50" : "bg-gray-50";
const textoTabla = modoOscuro ? "text-gray-300" : "text-gray-700";
const bordeDivisor = modoOscuro ? "divide-gray-700" : "divide-gray-100";
const bgFilaHover = modoOscuro ? "hover:bg-gray-700/50" : "hover:bg-gray-50";
const bgInput = modoOscuro ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-800";

return (
  <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-300`}>
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}
      <div className={`${bgTarjeta} rounded-xl shadow-sm p-4 mb-8 border ${bordeTarjeta}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${textoPrincipal} flex items-center gap-2`}>
              <span className="text-pink-500">💅</span> Gestión de Servicios
            </h1>
            <p className={`${textoSecundario} text-sm mt-1`}>Agregá, editá o eliminá los servicios de la estética</p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* 🌙 SWITCH MODO OSCURO */}
            <button
              onClick={() => setModoOscuro(!modoOscuro)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                modoOscuro 
                  ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400" 
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
              title={modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              <span className="text-lg">{modoOscuro ? "☀️" : "🌙"}</span>
              <span className="text-sm font-medium">{modoOscuro ? "Claro" : "Oscuro"}</span>
            </button>

            <Link 
              href="/admin/reservas" 
              className="bg-white border-2 border-green-500 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
            >
              📋 Gestión de Reservas
            </Link>
            <Link href="/" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">
              ← Inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Formulario de Creación/Edición */}
      <div className={`${bgTarjeta} rounded-xl shadow-md p-6 mb-8 border ${bordeTarjeta}`}>
        <h2 className={`text-xl font-semibold ${textoPrincipal} mb-4`}>
          {editando ? '✏️ Editar Servicio' : '➕ Agregar Nuevo Servicio'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${textoSecundario} mb-1`}>Nombre del servicio</label>
            <input
              type="text"
              required
              value={formDatos.nombre}
              onChange={(e) => setFormDatos({ ...formDatos, nombre: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
              placeholder="Ej: Manicura Semipermanente"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${textoSecundario} mb-1`}>Descripción breve</label>
            <input
              type="text"
              value={formDatos.descripcion}
              onChange={(e) => setFormDatos({ ...formDatos, descripcion: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
              placeholder="Ej: Incluye limado, cutícula y esmaltado"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textoSecundario} mb-1`}>Precio ($)</label>
            <input
              type="number"
              required
              min="0"
              value={formDatos.precio}
              onChange={(e) => setFormDatos({ ...formDatos, precio: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
              placeholder="0"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textoSecundario} mb-1`}>Duración (minutos)</label>
            <select
              value={formDatos.duracion_min}
              onChange={(e) => setFormDatos({ ...formDatos, duracion_min: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${bgInput}`}
            >
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1 hora y media</option>
              <option value="120">2 horas</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 font-semibold transition-colors"
            >
              {editando ? '💾 Actualizar Servicio' : '💾 Guardar Servicio'}
            </button>
            {editando && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
              >
                ❌ Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Servicios */}
      <div className={`${bgTarjeta} rounded-xl shadow-md overflow-hidden border ${bordeTarjeta}`}>
        <div className={`p-4 ${bgHeader} border-b ${bordeTarjeta}`}>
          <h2 className={`text-xl font-semibold ${textoPrincipal}`}>📋 Servicios Cargados</h2>
        </div>
        
        {cargando ? (
          <div className={`p-8 text-center ${textoSecundario}`}>Cargando servicios...</div>
        ) : servicios.length === 0 ? (
          <div className={`p-8 text-center ${textoSecundario}`}>No hay servicios cargados aún.</div>
        ) : (
          <table className="w-full">
            <thead className={bgHeader}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textoTabla}`}>Servicio</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textoTabla}`}>Duración</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textoTabla}`}>Precio</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textoTabla}`}>Estado</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textoTabla}`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${bordeDivisor}`}>
              {servicios.map((servicio) => (
                <tr key={servicio.id} className={bgFilaHover}>
                  <td className={`px-4 py-3 ${textoTabla}`}>
                    <div className={`font-medium ${textoPrincipal}`}>{servicio.nombre}</div>
                    <div className="text-xs text-gray-500">{servicio.descripcion}</div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${textoTabla}`}>{servicio.duracion_min} min</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${modoOscuro ? 'text-gray-100' : 'text-gray-800'}`}>
                    ${servicio.precio.toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      servicio.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {servicio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleEditar(servicio)}
                        className="text-sm px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => toggleActivo(servicio.id, servicio.activo)}
                        className={`text-sm px-3 py-1 rounded transition-colors ${
                          servicio.activo 
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {servicio.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleEliminar(servicio.id, servicio.nombre)}
                        className="text-sm px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
);
}