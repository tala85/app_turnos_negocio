"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "admin_modo_oscuro";

export function useModoOscuro() {
  const [modoOscuro, setModoOscuroState] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModoOscuroState(localStorage.getItem(STORAGE_KEY) === "true");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setListo(true);
  }, []);

  const setModoOscuro = (valor: boolean) => {
    setModoOscuroState(valor);
    localStorage.setItem(STORAGE_KEY, String(valor));
  };

  return { modoOscuro, setModoOscuro, listo };
}