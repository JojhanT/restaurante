import { useState } from "react";
import { calcularCuenta, formatoPesos } from "../utils/cuenta.js";
import { DESCUENTOS } from "../data/mock.js";
import { mostrarToast } from "../utils/toast.js";

export default function Pedido({ mesa, menu, actualizar, registrarVenta }) {
  const [platoId, setPlatoId] = useState(menu[0]?.id ?? "");
  const [conPropina, setConPropina] = useState(true);
  const [factura, setFactura] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [descuento, setDescuento] = useState({ codigo: "", pct: 0 });
  const [aviso, setAviso] = useState("");

  function aplicarCodigo() {
    const clave = codigo.trim().toUpperCase();
    if (DESCUENTOS[clave]) {
      setDescuento({ codigo: clave, pct: DESCUENTOS[clave] });
      mostrarToast(`Descuento ${clave} aplicado`);
      setAviso(`Código ${clave} aplicado: ${DESCUENTOS[clave] * 100}% de descuento`);
    } else {
      setDescuento({ codigo: "", pct: 0 });
      setAviso("Código no válido");
    }
  }

  function abrir() {
    actualizar(mesa.id, { estado: "ocupada" });
    mostrarToast(`Pedido abierto en la mesa ${mesa.id}`);
  }

  function agregar() {
    const id = Number(platoId);
    const existe = mesa.items.find((i) => i.platoId === id);
    const items = existe
      ? mesa.items.map((i) => (i.platoId === id ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...mesa.items, { platoId: id, cantidad: 1 }];
    actualizar(mesa.id, { items });
    mostrarToast(`${menu.find((p) => p.id === id)?.nombre} agregado`);
  }

  function cambiarCantidad(id, delta) {
    const items = mesa.items
      .map((i) => (i.platoId === id ? { ...i, cantidad: i.cantidad + delta } : i))
      .filter((i) => i.cantidad > 0);
    actualizar(mesa.id, { items });
  }

  function cobrar() {
    const cuenta = calcularCuenta(mesa.items, menu, conPropina, descuento.pct);
    const platos = mesa.items
      .map((i) => `${i.cantidad}x ${menu.find((p) => p.id === i.platoId)?.nombre ?? "Plato"}`)
      .join(", ");
    registrarVenta({ mesa: mesa.id, platos, cuenta });
    setFactura({ mesa: mesa.id, lineas: mesa.items, cuenta });
    actualizar(mesa.id, { estado: "libre", items: [] });
    mostrarToast(`Mesa ${mesa.id} cobrada: ${formatoPesos(cuenta.total)}`);
  }

  if (factura) {
    return (
      <div className="card factura">
        <div className="confeti" aria-hidden="true">
          {["🎉", "✨", "🎊", "⭐", "🎉", "✨", "🎊", "⭐"].map((c, i) => (
            <span key={i} style={{ left: `${8 + i * 12}%`, animationDelay: `${i * 0.08}s` }}>{c}</span>
          ))}
        </div>
        <h2>🧾 Factura - Mesa {factura.mesa}</h2>
        <ul>
          {factura.lineas.map((l) => {
            const p = menu.find((x) => x.id === l.platoId);
            return (
              <li key={l.platoId}>
                <span>{l.cantidad} x {p?.nombre}</span>
                <span>{formatoPesos((p?.precio ?? 0) * l.cantidad)}</span>
              </li>
            );
          })}
        </ul>
        <hr />
        <div className="fila"><span>Subtotal</span><span>{formatoPesos(factura.cuenta.subtotal)}</span></div>
        {factura.cuenta.descuento > 0 && (
          <div className="fila"><span>Descuento</span><span>-{formatoPesos(factura.cuenta.descuento)}</span></div>
        )}
        <div className="fila"><span>Impoconsumo (8%)</span><span>{formatoPesos(factura.cuenta.impuesto)}</span></div>
        <div className="fila"><span>Propina (10%)</span><span>{formatoPesos(factura.cuenta.propina)}</span></div>
        <div className="fila total"><span>TOTAL</span><span>{formatoPesos(factura.cuenta.total)}</span></div>
        <button onClick={() => setFactura(null)}>Cerrar</button>
      </div>
    );
  }

  if (mesa.estado === "libre") {
    return (
      <div className="card">
        <h2>Mesa {mesa.id}</h2>
        <p>La mesa está libre.</p>
        <button onClick={abrir}>Abrir pedido</button>
      </div>
    );
  }

  const cuenta = calcularCuenta(mesa.items, menu, conPropina, descuento.pct);

  return (
    <div className="card">
      <h2>Pedido - Mesa {mesa.id}</h2>
      <div className="agregar">
        <select value={platoId} onChange={(e) => setPlatoId(e.target.value)}>
          {menu.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} - {formatoPesos(p.precio)}</option>
          ))}
        </select>
        <button onClick={agregar}>Agregar</button>
      </div>

      {mesa.items.length === 0 && <p className="vacio">Aún no hay platos.</p>}
      <ul className="items">
        {mesa.items.map((i) => {
          const p = menu.find((x) => x.id === i.platoId);
          return (
            <li key={i.platoId}>
              <span>{p?.emoji} {p?.nombre}</span>
              <span className="cantidad">
                <button onClick={() => cambiarCantidad(i.platoId, -1)}>-</button>
                {i.cantidad}
                <button onClick={() => cambiarCantidad(i.platoId, 1)}>+</button>
              </span>
              <span>{formatoPesos((p?.precio ?? 0) * i.cantidad)}</span>
            </li>
          );
        })}
      </ul>

      <div className="codigo">
        <input
          placeholder="Código de descuento"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <button onClick={aplicarCodigo} disabled={!codigo.trim()}>Aplicar</button>
      </div>
      {aviso && <p className={descuento.pct ? "ok" : "error"}>{aviso}</p>}
      {cuenta.descuento > 0 && (
        <div className="fila"><span>Descuento</span><span>-{formatoPesos(cuenta.descuento)}</span></div>
      )}

      <label className="check">
        <input type="checkbox" checked={conPropina} onChange={(e) => setConPropina(e.target.checked)} />
        Incluir propina sugerida (10%)
      </label>
      <div className="fila total"><span>Total</span><span>{formatoPesos(cuenta.total)}</span></div>
      <button disabled={mesa.items.length === 0} onClick={cobrar}>Cobrar y liberar mesa</button>
    </div>
  );
}
