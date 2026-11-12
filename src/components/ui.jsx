import Icono from "./Icono.jsx";

// Piezas de interfaz compartidas por todas las pantallas.

export const TONO_PEDIDO = { pendiente: "neutro", en_preparacion: "aviso", listo: "info", servido: "ok" };
export const TONO_RESERVA = { pendiente: "aviso", confirmada: "ok", cancelada: "neutro" };
export const ETIQUETA_RESERVA = { pendiente: "Pendiente", confirmada: "Confirmada", cancelada: "Cancelada" };

export const iniciales = (nombre) =>
  nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export function Campo({ etiqueta, ayuda, children }) {
  return (
    <label className="campo">
      <span className="campo-etiqueta">{etiqueta}</span>
      {children}
      {ayuda && <span className="campo-ayuda">{ayuda}</span>}
    </label>
  );
}

export function Insignia({ tono = "neutro", children }) {
  return <span className={`badge badge-${tono}`}>{children}</span>;
}

export function Kpi({ icono, tono = "primario", valor, etiqueta }) {
  return (
    <div className={`card kpi tono-${tono}`}>
      <div className="kpi-icono"><Icono nombre={icono} tam={20} /></div>
      <div>
        <div className="kpi-valor">{valor}</div>
        <div className="kpi-etiqueta">{etiqueta}</div>
      </div>
    </div>
  );
}

export function Vacio({ icono = "info", titulo, children }) {
  return (
    <div className="vacio">
      <div className="vacio-icono"><Icono nombre={icono} tam={22} /></div>
      <strong>{titulo}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Alerta({ tipo = "error", children }) {
  return (
    <p className={`alerta alerta-${tipo}`} role={tipo === "error" ? "alert" : undefined}>
      <Icono nombre={tipo === "ok" ? "check" : "info"} tam={16} />
      <span>{children}</span>
    </p>
  );
}

export function TituloSeccion({ titulo, texto, children }) {
  return (
    <div className="seccion-titulo">
      <div>
        <h2>{titulo}</h2>
        {texto && <p>{texto}</p>}
      </div>
      {children}
    </div>
  );
}
