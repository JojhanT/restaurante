import { useCallback, useEffect, useRef, useState } from "react";

const PREFIJO = "sigr:";

function leer(clave, inicial) {
  try {
    const guardado = localStorage.getItem(PREFIJO + clave);
    return guardado ? JSON.parse(guardado) : inicial;
  } catch {
    return inicial;
  }
}

// Como useState, pero persiste en localStorage y se sincroniza entre pestañas:
// si otra pestaña (por ejemplo, la de otro mesero) cambia el dato, esta se actualiza al instante.
export default function useLocalStorage(clave, inicial) {
  const [valor, setValorInterno] = useState(() => leer(clave, inicial));
  const ref = useRef(valor);
  ref.current = valor;

  const setValor = useCallback(
    (nuevo) => {
      const siguiente = typeof nuevo === "function" ? nuevo(ref.current) : nuevo;
      ref.current = siguiente;
      setValorInterno(siguiente);
      try {
        localStorage.setItem(PREFIJO + clave, JSON.stringify(siguiente));
      } catch {
        /* sin almacenamiento disponible */
      }
    },
    [clave]
  );

  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key === PREFIJO + clave) setValorInterno(leer(clave, inicial));
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps

  return [valor, setValor];
}

export function borrarTodo() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIJO))
    .forEach((k) => localStorage.removeItem(k));
}
