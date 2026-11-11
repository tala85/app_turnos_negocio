import { useState, useEffect } from 'react';

export function useModoOscuro() {
  const [modoOscuro, setModoOscuro] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_modo_oscuro') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('admin_modo_oscuro', String(modoOscuro));
  }, [modoOscuro]);

  return { modoOscuro, setModoOscuro };
}