import { useEffect, useState } from "react";

export default function Toasts() {
  const [lista, setLista] = useState([]);

  useEffect(() => {
    function alRecibir(e) {
      const toast = { id: Date.now() + Math.random(), ...e.detail };
      setLista((prev) => [...prev.slice(-3), toast]);
      setTimeout(() => setLista((prev) => prev.filter((t) => t.id !== toast.id)), 2600);
    }
    window.addEventListener("toast", alRecibir);
    return () => window.removeEventListener("toast", alRecibir);
  }, []);

  return (
    <div className="toasts" role="status" aria-live="polite">
      {lista.map((t) => (
        <div key={t.id} className={`toast ${t.tipo}`}>
          {t.tipo === "ok" ? "✅" : "⚠️"} {t.mensaje}
        </div>
      ))}
    </div>
  );
}
