import { useState } from "react";
import { calcularCuenta, DESCUENTOS } from "../domain/cuenta.js";
import { formatoPesos, fechaISO, horaHM } from "../domain/format.js";
import { agregarItem, avanzar, cambiarCantidad, ETIQUETAS, nuevoPedido, pedidoDeMesa, sePuedeEditar, siguienteEstado } from "../domain/pedidos.js";
import { MEDIOS_PAGO, nuevaFactura } from "../domain/caja.js";
import { mostrarToast } from "../utils/toast.js";

export default function Pedidos({ usuario, mesas, menu, categorias, pedidos, setPedidos, facturas, setFacturas }) {
  const [seleccionada, setSeleccionada] = useState(null);
  const [factura, setFactura] = useState(null);
  const mesa = mesas.find((m) => m.id === seleccionada);
  const pedido = mesa ? pedidoDeMesa(pedidos, mesa.id) : null;
  const abiertos = pedidos.filter((p) => p.estado !== "cobrado" && p.estado !== "cancelado");
  const porCobrar = abiertos.reduce((acc, p) => acc + calcularCuenta(p.items).subtotal, 0);

  const guardar = (p) => setPedidos((prev) => prev.map((x) => (x.id === p.id ? p : x)));

  function abrir() {
    setPedidos((prev) => [...prev, nuevoPedido(prev, mesa.id, usuario.id)]);
    mostrarToast(`Pedido abierto en la mesa ${mesa.id}`);
  }

  function cobrar(cuenta, medioPago) {
    const f = nuevaFactura(facturas, { pedido, cuenta, medioPago, cajero: usuario.usuario, fecha: fechaISO(), hora: horaHM() });
    setFacturas([...facturas, f]);
    guardar({ ...pedido, estado: "cobrado" });
    setFactura(f);
    mostrarToast(`Mesa ${mesa.id} cobrada: ${formatoPesos(cuenta.total)}`);
  }

  return (
    <section>
      <div className="stats">
        <div className="card stat"><div className="ico">🟢</div><div><strong>{mesas.length - abiertos.length}</strong><span>Mesas libres</span></div></div>
        <div className="card stat"><div className="ico">🔴</div><div><strong>{abiertos.length}</strong><span>Mesas ocupadas</span></div></div>
        <div className="card stat"><div className="ico">👨‍🍳</div><div><strong>{abiertos.filter((p) => p.estado === "en_preparacion").length}</strong><span>En cocina</span></div></div>
        <div className="card stat"><div className="ico">💰</div><div><strong>{formatoPesos(porCobrar)}</strong><span>Por cobrar</span></div></div>
      </div>

      <div className="dos-columnas">
        <div>
          <h2>Mesas</h2>
          <div className="grid">
            {mesas.map((m) => {
              const p = pedidoDeMesa(pedidos, m.id);
              return (
                <button
                  key={m.id}
                  className={`card mesa ${p ? "ocupada" : "libre"} ${seleccionada === m.id ? "sel" : ""}`}
                  onClick={() => { setSeleccionada(m.id); setFactura(null); }}
                >
                  <span className="silla">{p ? "🍽️" : "🪑"}</span>
                  <h3>Mesa {m.id}</h3>
                  <small>{m.capacidad} personas</small>
                  <span className={`badge ${p ? p.estado : "libre"}`}>{p ? ETIQUETAS[p.estado] : "libre"}</span>
                  {p && <strong>{formatoPesos(calcularCuenta(p.items).subtotal)}</strong>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="panel">
          {factura ? (
            <Factura f={factura} cerrar={() => setFactura(null)} />
          ) : !mesa ? (
            <div className="card vacio">👈 Selecciona una mesa para ver o crear su pedido.</div>
          ) : !pedido ? (
            <div className="card">
              <h2>Mesa {mesa.id}</h2>
              <p>La mesa está libre.</p>
              <button onClick={abrir}>Abrir pedido</button>
            </div>
          ) : (
            <Detalle key={pedido.id} pedido={pedido} menu={menu} categorias={categorias} guardar={guardar} cobrar={cobrar} />
          )}
        </div>
      </div>
    </section>
  );
}

function Detalle({ pedido, menu, categorias, guardar, cobrar }) {
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id);
  const [conPropina, setConPropina] = useState(true);
  const [medioPago, setMedioPago] = useState(MEDIOS_PAGO[0]);
  const [codigo, setCodigo] = useState("");
  const [descuento, setDescuento] = useState({ codigo: "", pct: 0 });
  const [aviso, setAviso] = useState("");
  const editable = sePuedeEditar(pedido);
  const cuenta = calcularCuenta(pedido.items, { conPropina, porcentajeDescuento: descuento.pct });
  const sig = siguienteEstado(pedido.estado);

  function aplicarCodigo() {
    const clave = codigo.trim().toUpperCase();
    if (DESCUENTOS[clave]) {
      setDescuento({ codigo: clave, pct: DESCUENTOS[clave] });
      setAviso(`Código ${clave} aplicado: ${DESCUENTOS[clave] * 100}% de descuento`);
    } else {
      setDescuento({ codigo: "", pct: 0 });
      setAviso("Código no válido");
    }
  }

  function avanzarEstado() {
    const r = avanzar(pedido);
    if (r.error) return mostrarToast(r.error, "aviso");
    guardar(r.pedido);
    mostrarToast(`Pedido: ${ETIQUETAS[r.pedido.estado]}`);
  }

  return (
    <div className="card">
      <h2>Pedido #{pedido.id} · Mesa {pedido.mesaId}</h2>
      <div className="linea-estado" aria-label="Estado del pedido">
        {["pendiente", "en_preparacion", "listo", "servido"].map((e) => (
          <span key={e} className={e === pedido.estado ? "paso actual" : "paso"}>{ETIQUETAS[e]}</span>
        ))}
      </div>

      {editable && (
        <div className="selector">
          <div className="filtros">
            {categorias.map((c) => (
              <button key={c.id} className={categoriaId === c.id ? "chip activo" : "chip"} onClick={() => setCategoriaId(c.id)}>
                {c.nombre}
              </button>
            ))}
          </div>
          <div className="mini-grid">
            {menu.filter((p) => p.activo && p.categoriaId === categoriaId).map((p) => (
              <button key={p.id} className="mini" onClick={() => guardar(agregarItem(pedido, p))} title={`Agregar ${p.nombre}`}>
                <span className="mini-emoji">{p.emoji}</span>
                <span className="mini-nombre">{p.nombre}</span>
                <span className="mini-precio">{formatoPesos(p.precio)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {pedido.items.length === 0 && <p className="vacio">Aún no hay platos.</p>}
      <ul className="items">
        {pedido.items.map((i) => (
          <li key={i.platoId}>
            <span>{i.emoji} {i.nombre}</span>
            <span className="cantidad">
              {editable && <button onClick={() => guardar(cambiarCantidad(pedido, i.platoId, -1))}>-</button>}
              {i.cantidad}
              {editable && <button onClick={() => guardar(cambiarCantidad(pedido, i.platoId, 1))}>+</button>}
            </span>
            <span>{formatoPesos(i.precio * i.cantidad)}</span>
          </li>
        ))}
      </ul>

      {sig && (
        <button onClick={avanzarEstado}>
          {pedido.estado === "pendiente" ? "Enviar a cocina" : `Marcar como ${ETIQUETAS[sig].toLowerCase()}`}
        </button>
      )}

      {pedido.estado === "servido" && (
        <>
          <div className="codigo">
            <input placeholder="Código de descuento" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            <button onClick={aplicarCodigo} disabled={!codigo.trim()}>Aplicar</button>
          </div>
          {aviso && <p className={descuento.pct ? "ok" : "error"}>{aviso}</p>}
          {cuenta.descuento > 0 && <div className="fila"><span>Descuento</span><span>-{formatoPesos(cuenta.descuento)}</span></div>}
          <label className="check">
            <input type="checkbox" checked={conPropina} onChange={(e) => setConPropina(e.target.checked)} />
            Incluir propina sugerida (10%)
          </label>
          <select value={medioPago} onChange={(e) => setMedioPago(e.target.value)} aria-label="Medio de pago">
            {MEDIOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="fila total"><span>Total</span><span>{formatoPesos(cuenta.total)}</span></div>
          <button onClick={() => cobrar(cuenta, medioPago)}>Cobrar y liberar mesa</button>
        </>
      )}
      {pedido.estado === "pendiente" && pedido.items.length === 0 && (
        <button className="peligro" onClick={() => guardar({ ...pedido, estado: "cancelado" })}>Cancelar pedido</button>
      )}
    </div>
  );
}

function Factura({ f, cerrar }) {
  return (
    <div className="card factura">
      <h2>🧾 Factura #{f.id} · Mesa {f.mesaId}</h2>
      <ul>
        {f.items.map((i) => (
          <li key={i.platoId}><span>{i.cantidad} x {i.nombre}</span><span>{formatoPesos(i.precio * i.cantidad)}</span></li>
        ))}
      </ul>
      <hr />
      <div className="fila"><span>Subtotal</span><span>{formatoPesos(f.cuenta.subtotal)}</span></div>
      {f.cuenta.descuento > 0 && <div className="fila"><span>Descuento</span><span>-{formatoPesos(f.cuenta.descuento)}</span></div>}
      <div className="fila"><span>Impoconsumo (8%)</span><span>{formatoPesos(f.cuenta.impuesto)}</span></div>
      <div className="fila"><span>Propina (10%)</span><span>{formatoPesos(f.cuenta.propina)}</span></div>
      <div className="fila total"><span>TOTAL</span><span>{formatoPesos(f.cuenta.total)}</span></div>
      <p className="suave">Pagado con {f.medioPago} · {f.fecha} {f.hora}</p>
      <button onClick={cerrar}>Cerrar</button>
    </div>
  );
}
