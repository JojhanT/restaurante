import { useEffect, useState } from "react";

// Igual que useState, pero guarda el valor en localStorage para que sobreviva a recargas.
export default function useLocalStorage(clave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado ? JSON.parse(guardado) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [clave, valor]);

  return [valor, setValor];
}
