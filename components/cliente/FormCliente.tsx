'use client';

import type { ClienteInput } from '@/lib/types';

type Props = {
  cliente: ClienteInput;
  onChange: (cliente: ClienteInput) => void;
};

export default function FormCliente({ cliente, onChange }: Props) {
  // Actualiza un campo del cliente
  const handleChange = (campo: keyof ClienteInput, valor: string) => {
    onChange({ ...cliente, [campo]: valor });
  };

  // Valida el DNI (solo números, 7-9 dígitos)
  const validarDNI = (valor: string) => {
    return valor.replace(/\D/g, '').slice(0, 9);
  };

  // Valida el teléfono (solo números y +, hasta 20 caracteres)
  const validarTelefono = (valor: string) => {
    return valor.replace(/[^\d+]/g, '').slice(0, 20);
  };

  return (
    <div className="space-y-4">
      {/* DNI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DNI *
        </label>
        <input
          type="text"
          value={cliente.dni}
          onChange={(e) => handleChange('dni', validarDNI(e.target.value))}
          placeholder="12345678"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
          maxLength={9}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {cliente.dni.length >= 7 && cliente.dni.length <= 9
            ? '✅ DNI válido'
            : 'Debe tener entre 7 y 9 dígitos'}
        </p>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre *
        </label>
        <input
          type="text"
          value={cliente.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Juan"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Apellido */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Apellido *
        </label>
        <input
          type="text"
          value={cliente.apellido}
          onChange={(e) => handleChange('apellido', e.target.value)}
          placeholder="Pérez"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono *
        </label>
        <input
          type="tel"
          value={cliente.telefono}
          onChange={(e) =>
            handleChange('telefono', validarTelefono(e.target.value))
          }
          placeholder="+54 376 4123456"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
          required
        />
      </div>
    </div>
  );
}