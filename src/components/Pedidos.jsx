import { useState } from "react";
import Icono from "./Icono.jsx";
import { Alerta, Campo, Insignia, Kpi, TONO_PEDIDO, TituloSeccion, Vacio } from "./ui.jsx";
import { calcularCuenta, DESCUENTOS } from "../domain/cuenta.js";
import { formatoPesos, fechaISO, horaHM } from "../domain/format.js";
import {
  agregarItem, avanzar, cambiarCantidad, ESTADOS, ETIQUETAS, nuevoPedido, pedidoDeMesa, sePuedeEditar, siguienteEstado,
} from "../domain/pedidos.js";
import { MEDIOS_PAGO, nuevaFactura } from "../domain/caja.js";
import { mostrarToast } from "../utils/toast.js";

const ACCION = {
  pendiente: { texto: "Enviar a cocina", icono: "fuego" },
  en_preparacion: { texto: "Marcar como listo", icono: "check" },
  listo: { texto: "Marcar como servido", icono: "check" },
};

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
    <>
      <div className="kpis">
        <Kpi icono="mesa" tono="ok" valor={mesas.length - abiertos.length} etiqueta="Mesas libres" />
        <Kpi icono="persona" tono="primario" valor={abiertos.length} etiqueta="Mesas ocupadas" />
        <Kpi icono="fuego" tono="aviso" valor={abiertos.filter((p) => p.estado === "en_preparacion").length} etiqueta="Pedidos en cocina" />
        <Kpi icono="dinero" tono="info" valor={formatoPesos(porCobrar)} etiqueta="Por cobrar (sin impuestos)" />
      </div>

      <div className="dos-columnas">
        <section>
          <TituloSeccion titulo="Plano del salón" texto="Toca una mesa para ver o abrir su pedido.">
            <div className="leyenda">
              <span><i className="punto punto-ok" /> Libre</span>
              <span><i className="punto punto-primario" /> Ocupada</span>
            </div>
          </TituloSeccion>
          <div className="salon">
            {mesas.map((m) => {
              const p = pedidoDeMesa(pedidos, m.id);
              return (
                <button
                  key={m.id}
                  className={`mesa ${p ? "ocupada" : "libre"} ${seleccionada === m.id ? "sel" : ""}`}
                  onClick={() => {
                    setSeleccionada(m.id);
                    setFactura(null);
                    // En pantallas angostas el panel queda debajo del plano: llevarlo a la vista.
                    if (window.innerWidth <= 960) setTimeout(() => document.querySelector(".panel")?.scrollIntoView({ behavior: "smooth" }), 50);
                  }}
                  aria-pressed={seleccionada === m.id}
                >
                  <div className="mesa-cab">
                    <div className="mesa-num"><small>Mesa</small>{m.id}</div>
                    <span className="mesa-cap" title={`Capacidad: ${m.capacidad} personas`}>
                      <Icono nombre="persona" tam={14} /> {m.capacidad}
                    </span>
                  </div>
                  {p ? <Insignia tono={TONO_PEDIDO[p.estado]}>{ETIQUETAS[p.estado]}</Insignia> : <Insignia tono="ok">Libre</Insignia>}
                  <span className="mesa-total">{p ? formatoPesos(calcularCuenta(p.items).subtotal) : "Disponible"}</span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="panel">
          {factura ? (
            <Factura f={factura} cerrar={() => setFactura(null)} />
          ) : !mesa ? (
            <div className="card">
              <Vacio icono="mesa" titulo="Ninguna mesa seleccionada">Elige una mesa del plano para gestionar su pedido.</Vacio>
            </div>
          ) : !pedido ? (
            <div className="card">
              <Vacio icono="pedidos" titulo={`Mesa ${mesa.id} disponible`}>Capacidad para {mesa.capacidad} personas.</Vacio>
              <button className="btn btn-primario btn-grande btn-bloque" onClick={abrir}>
                <Icono nombre="mas" /> Abrir pedido
              </button>
            </div>
          ) : (
            <Detalle key={pedido.id} pedido={pedido} menu={menu} categorias={categorias} guardar={guardar} cobrar={cobrar} />
          )}
        </aside>
      </div>
    </>
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
  const indice = ESTADOS.indexOf(pedido.estado);
  const unidades = pedido.items.reduce((acc, i) => acc + i.cantidad, 0);

  function aplicarCodigo() {
    const clave = codigo.trim().toUpperCase();
    if (DESCUENTOS[clave]) {
      setDescuento({ codigo: clave, pct: DESCUENTOS[clave] });
      setAviso(`Código ${clave} aplicado: ${DESCUENTOS[clave] * 100}% de descuento.`);
    } else {
      setDescuento({ codigo: "", pct: 0 });
      setAviso("Ese código no es válido.");
    }
  }

  function avanzarEstado() {
    const r = avanzar(pedido);
    if (r.error) return mostrarToast(r.error, "aviso");
    guardar(r.pedido);
    mostrarToast(`Pedido #${pedido.id}: ${ETIQUETAS[r.pedido.estado].toLowerCase()}`);
  }

  return (
    <div className="card pedido">
      <div className="card-titulo">
        <div>
          <span className="texto-suave texto-sm">Pedido #{pedido.id}</span>
          <h2>Mesa {pedido.mesaId}</h2>
        </div>
        <Insignia tono={TONO_PEDIDO[pedido.estado]}>{ETIQUETAS[pedido.estado]}</Insignia>
      </div>

      <ol className="pasos" aria-label="Avance del pedido">
        {ESTADOS.map((e, i) => (
          <li key={e} className={`paso ${i < indice ? "hecho" : ""} ${i === indice ? "actual" : ""}`}>
            <span className="paso-punto">{i < indice && <Icono nombre="check" tam={12} />}</span>
            {ETIQUETAS[e]}
          </li>
        ))}
      </ol>

      {editable && (
        <div className="selector">
          <span className="campo-etiqueta">Agregar platos</span>
          <div className="tabs" role="tablist">
            {categorias.map((c) => (
              <button key={c.id} role="tab" aria-selected={categoriaId === c.id} className={`tab ${categoriaId === c.id ? "activo" : ""}`} onClick={() => setCategoriaId(c.id)}>
                {c.nombre}
              </button>
            ))}
          </div>
          <div className="selector-platos">
            {menu.filter((p) => p.activo && p.categoriaId === categoriaId).map((p) => (
              <button key={p.id} className="opcion" onClick={() => guardar(agregarItem(pedido, p))} title={`Agregar ${p.nombre}`}>
                <span className="opcion-emoji">{p.emoji}</span>
                <span className="opcion-nombre">{p.nombre}</span>
                <span className="opcion-precio">{formatoPesos(p.precio)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="lineas-cab">
        <span className="campo-etiqueta">Detalle del pedido</span>
        <span className="texto-suave texto-sm">{unidades} {unidades === 1 ? "plato" : "platos"}</span>
      </div>
      {pedido.items.length === 0 ? (
        <p className="texto-suave texto-sm lineas-vacio">Aún no hay platos. Agrégalos desde la carta de arriba.</p>
      ) : (
        <ul className="lineas">
          {pedido.items.map((i) => (
            <li key={i.platoId}>
              <span className="linea-nombre"><span className="linea-emoji">{i.emoji}</span>{i.nombre}</span>
              {editable ? (
                <span className="stepper">
                  <button onClick={() => guardar(cambiarCantidad(pedido, i.platoId, -1))} aria-label={`Quitar un ${i.nombre}`}><Icono nombre="menos" tam={14} /></button>
                  <span>{i.cantidad}</span>
                  <button onClick={() => guardar(cambiarCantidad(pedido, i.platoId, 1))} aria-label={`Agregar un ${i.nombre}`}><Icono nombre="mas" tam={14} /></button>
                </span>
              ) : (
                <span className="cantidad-fija">× {i.cantidad}</span>
              )}
              <span className="linea-precio">{formatoPesos(i.precio * i.cantidad)}</span>
            </li>
          ))}
        </ul>
      )}

      {ACCION[pedido.estado] && (
        <button className="btn btn-primario btn-grande btn-bloque" onClick={avanzarEstado} disabled={pedido.items.length === 0}>
          <Icono nombre={ACCION[pedido.estado].icono} /> {ACCION[pedido.estado].texto}
        </button>
      )}
      {!editable && siguienteEstado(pedido.estado) && (
        <p className="texto-suave texto-sm centrado">El pedido ya está en cocina; no se pueden cambiar los platos.</p>
      )}

      {pedido.estado === "servido" && (
        <div className="cobro">
          <Campo etiqueta="Código de descuento">
            <div className="codigo">
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej. HOLA" />
              <button className="btn btn-secundario" onClick={aplicarCodigo} disabled={!codigo.trim()}>
                <Icono nombre="etiqueta" tam={16} /> Aplicar
              </button>
            </div>
          </Campo>
          {aviso && <Alerta tipo={descuento.pct ? "ok" : "error"}>{aviso}</Alerta>}

          <div className="campo">
            <span className="campo-etiqueta">Medio de pago</span>
            <div className="medios" role="radiogroup" aria-label="Medio de pago">
              {MEDIOS_PAGO.map((m) => (
                <button key={m} role="radio" aria-checked={medioPago === m} className={`medio ${medioPago === m ? "activo" : ""}`} onClick={() => setMedioPago(m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <label className="check">
            <input type="checkbox" checked={conPropina} onChange={(e) => setConPropina(e.target.checked)} />
            Incluir propina sugerida (10 %)
          </label>

          <div className="totales">
            <div className="fila"><span>Subtotal</span><span>{formatoPesos(cuenta.subtotal)}</span></div>
            {cuenta.descuento > 0 && <div className="fila fila-ok"><span>Descuento {descuento.codigo}</span><span>−{formatoPesos(cuenta.descuento)}</span></div>}
            <div className="fila"><span>Impoconsumo (8 %)</span><span>{formatoPesos(cuenta.impuesto)}</span></div>
            {cuenta.propina > 0 && <div className="fila"><span>Propina (10 %)</span><span>{formatoPesos(cuenta.propina)}</span></div>}
            <div className="fila fila-total"><span>Total a pagar</span><span>{formatoPesos(cuenta.total)}</span></div>
          </div>
          <button className="btn btn-primario btn-grande btn-bloque" onClick={() => cobrar(cuenta, medioPago)}>
            <Icono nombre="recibo" /> Cobrar y liberar mesa
          </button>
        </div>
      )}

      {pedido.estado === "pendiente" && pedido.items.length === 0 && (
        <button className="btn btn-peligro btn-bloque espacio-arriba" onClick={() => guardar({ ...pedido, estado: "cancelado" })}>
          <Icono nombre="cerrar" tam={16} /> Cancelar pedido
        </button>
      )}
    </div>
  );
}

function Factura({ f, cerrar }) {
  return (
    <div className="card recibo">
      <div className="recibo-cab">
        <div className="recibo-ok"><Icono nombre="check" tam={24} /></div>
        <h2>Pago registrado</h2>
        <p className="texto-suave texto-sm">Factura #{f.id} · Mesa {f.mesaId} · {f.fecha} {f.hora}</p>
      </div>
      <ul className="lineas">
        {f.items.map((i) => (
          <li key={i.platoId}>
            <span className="linea-nombre">{i.cantidad} × {i.nombre}</span>
            <span />
            <span className="linea-precio">{formatoPesos(i.precio * i.cantidad)}</span>
          </li>
        ))}
      </ul>
      <div className="totales">
        <div className="fila"><span>Subtotal</span><span>{formatoPesos(f.cuenta.subtotal)}</span></div>
        {f.cuenta.descuento > 0 && <div className="fila fila-ok"><span>Descuento</span><span>−{formatoPesos(f.cuenta.descuento)}</span></div>}
        <div className="fila"><span>Impoconsumo (8 %)</span><span>{formatoPesos(f.cuenta.impuesto)}</span></div>
        <div className="fila"><span>Propina (10 %)</span><span>{formatoPesos(f.cuenta.propina)}</span></div>
        <div className="fila fila-total"><span>Total</span><span>{formatoPesos(f.cuenta.total)}</span></div>
      </div>
      <p className="texto-suave texto-sm centrado espacio-arriba">Pagado con <strong className="capital">{f.medioPago}</strong></p>
      <button className="btn btn-secundario btn-bloque espacio-arriba" onClick={cerrar}>Listo</button>
    </div>
  );
}
