import { useState } from "react";
import Pedido from "./Pedido.jsx";
import { calcularCuenta, formatoPesos } from "../utils/cuenta.js";

export default function Mesas({ menu, mesas, setMesas, registrarVenta }) {
  const [seleccionada, setSeleccionada] = useState(null);
  const mesa = mesas.find((m) => m.id === seleccionada);

  const actualizar = (id, cambios) =>
    setMesas(mesas.map((m) => (m.id === id ? { ...m, ...cambios } : m)));

  const ocupadas = mesas.filter((m) => m.estado === "ocupada");
  const porCobrar = ocupadas.reduce((acc, m) => acc + calcularCuenta(m.items, menu).subtotal, 0);

  return (
    <section>
      <div className="stats">
        <div className="card stat">
          <div className="ico">🟢</div>
          <div><strong>{mesas.length - ocupadas.length}</strong><span>Mesas libres</span></div>
        </div>
        <div className="card stat">
          <div className="ico">🔴</div>
          <div><strong>{ocupadas.length}</strong><span>Mesas ocupadas</span></div>
        </div>
        <div className="card stat">
          <div className="ico">💰</div>
          <div><strong>{formatoPesos(porCobrar)}</strong><span>Por cobrar</span></div>
        </div>
        <div className="card stat">
          <div className="ico">📖</div>
          <div><strong>{menu.length}</strong><span>Platos en carta</span></div>
        </div>
      </div>

      <div className="dos-columnas">
        <div>
          <h2>Mesas</h2>
          <div className="grid">
            {mesas.map((m) => {
              const total = calcularCuenta(m.items, menu).subtotal;
              return (
                <button
                  key={m.id}
                  className={`card mesa ${m.estado} ${seleccionada === m.id ? "sel" : ""}`}
                  onClick={() => setSeleccionada(m.id)}
                >
                  <span className="silla">{m.estado === "libre" ? "🪑" : "🍽️"}</span>
                  <h3>Mesa {m.id}</h3>
                  <span className="sillas" aria-label={`${m.capacidad} personas`}>
                    {Array.from({ length: m.capacidad }, (_, k) => <i key={k} />)}
                  </span>
                  <small>{m.capacidad} personas</small>
                  <span className={`badge ${m.estado}`}>{m.estado}</span>
                  {m.estado === "ocupada" && <strong>{formatoPesos(total)}</strong>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="panel">
          {mesa ? (
            <Pedido
              key={mesa.id}
              mesa={mesa}
              menu={menu}
              actualizar={actualizar}
              registrarVenta={registrarVenta}
            />
          ) : (
            <div className="card vacio">👈 Selecciona una mesa para ver o crear su pedido.</div>
          )}
        </div>
      </div>
    </section>
  );
}
