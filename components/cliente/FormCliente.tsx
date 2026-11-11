'use client';

import type { ClienteInput } from '@/lib/types';

type Props = {
  cliente: ClienteInput;
  onChange: (cliente: ClienteInput) => void;
};

export default function FormCliente({ cliente, onChange }: Props) {
  const handleChange = (campo: keyof ClienteInput, valor: string) => {
    onChange({ ...cliente, [campo]: valor });
  };

  const validarDNI = (valor: string) => valor.replace(/\D/g, '').slice(0, 9);
  const validarTelefono = (valor: string) => valor.replace(/[^\d+]/g, '').slice(0, 20);

  return (
    <div className="space-y-4">
      {/* DNI */}
      <div>
        <label htmlFor="dni" className="block text-sm font-semibold text-gray-700 mb-1">
          DNI *
        </label>
        <input
          id="dni"
          type="text"
          inputMode="numeric"
          value={cliente.dni}
          onChange={(e) => handleChange('dni', validarDNI(e.target.value))}
          placeholder="12345678"
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-base focus:border-pink-500 focus:outline-none transition-colors"
          maxLength={9}
          required
        />
        <p className={`mt-1 text-xs ${cliente.dni.length >= 7 ? 'text-emerald-600' : 'text-gray-500'}`}>
          {cliente.dni.length >= 7 ? '✅ DNI válido' : 'Entre 7 y 9 dígitos'}
        </p>
      </div>

      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-1">
          Nombre *
        </label>
        <input
          id="nombre"
          type="text"
          value={cliente.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Juan"
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-base focus:border-pink-500 focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Apellido */}
      <div>
        <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700 mb-1">
          Apellido *
        </label>
        <input
          id="apellido"
          type="text"
          value={cliente.apellido}
          onChange={(e) => handleChange('apellido', e.target.value)}
          placeholder="Pérez"
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-base focus:border-pink-500 focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-1">
          Teléfono *
        </label>
        <input
          id="telefono"
          type="tel"
          inputMode="tel"
          value={cliente.telefono}
          onChange={(e) => handleChange('telefono', validarTelefono(e.target.value))}
          placeholder="+54 376 4123456"
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-base focus:border-pink-500 focus:outline-none transition-colors"
          required
        />
      </div>
    </div>
  );
}