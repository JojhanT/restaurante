import { useState } from "react";
import { aCSV, cerrarCaja, pendientesDeCierre, platosMasVendidos, reportePorDia, resumen } from "../domain/caja.js";
import { fechaISO, formatoPesos, horaHM } from "../domain/format.js";
import { mostrarToast } from "../utils/toast.js";

function descargar(nombre, contenido) {
  const url = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Caja({ usuario, facturas, setFacturas, cierres, setCierres }) {
  const [efectivo, setEfectivo] = useState("");
  const [error, setError] = useState("");
  const pendientes = pendientesDeCierre(facturas);
  const r = resumen(pendientes);
  const dias = reportePorDia(facturas);
  const top = platosMasVendidos(facturas);

  function cerrar(e) {
    e.preventDefault();
    const res = cerrarCaja(facturas, cierres, {
      efectivoContado: Number(efectivo), usuario: usuario.usuario, fecha: fechaISO(), hora: horaHM(),
    });
    if (res.error) return setError(res.error);
    if (!window.confirm(`Cerrar caja con ${res.cierre.facturas} facturas por ${formatoPesos(res.cierre.total)}?`)) return;
    setFacturas(res.facturas);
    setCierres([...cierres, res.cierre]);
    setEfectivo("");
    setError("");
    mostrarToast(`Caja cerrada. Diferencia: ${formatoPesos(res.cierre.diferencia)}`);
  }

  return (
    <section>
      <div className="stats">
        <div className="card stat"><div className="ico">🧾</div><div><strong>{r.cantidad}</strong><span>Facturas sin cierre</span></div></div>
        <div className="card stat"><div className="ico">💵</div><div><strong>{formatoPesos(r.total)}</strong><span>Total vendido</span></div></div>
        <div className="card stat"><div className="ico">🎁</div><div><strong>{formatoPesos(r.propinas)}</strong><span>Propinas</span></div></div>
        <div className="card stat"><div className="ico">📊</div><div><strong>{formatoPesos(r.promedio)}</strong><span>Ticket promedio</span></div></div>
      </div>

      <div className="dos-columnas">
        <form className="card form" onSubmit={cerrar}>
          <h3>Cierre de caja</h3>
          <div className="fila"><span>Efectivo</span><span>{formatoPesos(r.porMedio.efectivo)}</span></div>
          <div className="fila"><span>Tarjeta</span><span>{formatoPesos(r.porMedio.tarjeta)}</span></div>
          <div className="fila"><span>Transferencia</span><span>{formatoPesos(r.porMedio.transferencia)}</span></div>
          <input type="number" min="0" placeholder="Efectivo contado en caja" value={efectivo} onChange={(e) => setEfectivo(e.target.value)} />
          <button type="submit" disabled={pendientes.length === 0}>Cerrar caja</button>
          {error && <p className="error">{error}</p>}
        </form>
        <div className="card">
          <h3>Platos más vendidos</h3>
          {top.length === 0 ? <p className="vacio">Sin ventas todavía.</p> : (
            <ol className="top">{top.map((t) => <li key={t.nombre}><span>{t.nombre}</span><strong>{t.cantidad}</strong></li>)}</ol>
          )}
        </div>
      </div>

      <div className="seccion-titulo">
        <h2>Reporte diario</h2>
        {facturas.length > 0 && <button onClick={() => descargar("ventas.csv", aCSV(facturas))}>⬇ Exportar CSV</button>}
      </div>
      {dias.length === 0 ? (
        <div className="card vacio">Aún no hay ventas. Cobra un pedido desde "Mesas y pedidos".</div>
      ) : (
        <div className="card tabla-wrap">
          <table className="tabla">
            <thead><tr><th>Fecha</th><th>Facturas</th><th>Subtotal</th><th>Impuesto</th><th>Propinas</th><th>Total</th></tr></thead>
            <tbody>
              {dias.map((d) => (
                <tr key={d.fecha}>
                  <td>{d.fecha}</td><td>{d.cantidad}</td><td>{formatoPesos(d.subtotal)}</td>
                  <td>{formatoPesos(d.impuesto)}</td><td>{formatoPesos(d.propinas)}</td><td><strong>{formatoPesos(d.total)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cierres.length > 0 && (
        <>
          <div className="seccion-titulo"><h2>Cierres anteriores</h2></div>
          <div className="card tabla-wrap">
            <table className="tabla">
              <thead><tr><th>#</th><th>Fecha</th><th>Facturas</th><th>Total</th><th>Esperado</th><th>Contado</th><th>Diferencia</th></tr></thead>
              <tbody>
                {[...cierres].reverse().map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td><td>{c.fecha} {c.hora}</td><td>{c.facturas}</td><td>{formatoPesos(c.total)}</td>
                    <td>{formatoPesos(c.efectivoEsperado)}</td><td>{formatoPesos(c.efectivoContado)}</td>
                    <td className={c.diferencia === 0 ? "" : "error"}>{formatoPesos(c.diferencia)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
