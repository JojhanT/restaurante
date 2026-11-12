import { useState } from "react";
import Icono from "./Icono.jsx";
import { Alerta, Campo, Kpi, TituloSeccion, Vacio } from "./ui.jsx";
import { aCSV, cerrarCaja, MEDIOS_PAGO, pendientesDeCierre, platosMasVendidos, reportePorDia, resumen } from "../domain/caja.js";
import { fechaISO, formatoPesos, horaHM } from "../domain/format.js";
import { mostrarToast } from "../utils/toast.js";

const ICONO_MEDIO = { efectivo: "dinero", tarjeta: "caja", transferencia: "tendencia" };

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
  const maxTop = top[0]?.cantidad ?? 1;
  const diferencia = efectivo === "" ? null : Number(efectivo) - r.porMedio.efectivo;

  function cerrar(e) {
    e.preventDefault();
    const res = cerrarCaja(facturas, cierres, {
      efectivoContado: efectivo === "" ? NaN : Number(efectivo), usuario: usuario.usuario, fecha: fechaISO(), hora: horaHM(),
    });
    if (res.error) return setError(res.error);
    if (!window.confirm(`¿Cerrar caja con ${res.cierre.facturas} facturas por ${formatoPesos(res.cierre.total)}?`)) return;
    setFacturas(res.facturas);
    setCierres([...cierres, res.cierre]);
    setEfectivo("");
    setError("");
    mostrarToast(`Caja cerrada. Diferencia: ${formatoPesos(res.cierre.diferencia)}`, res.cierre.diferencia === 0 ? "ok" : "aviso");
  }

  return (
    <>
      <div className="kpis">
        <Kpi icono="recibo" tono="primario" valor={r.cantidad} etiqueta="Facturas sin cerrar" />
        <Kpi icono="dinero" tono="ok" valor={formatoPesos(r.total)} etiqueta="Total vendido" />
        <Kpi icono="regalo" tono="aviso" valor={formatoPesos(r.propinas)} etiqueta="Propinas" />
        <Kpi icono="grafica" tono="info" valor={formatoPesos(r.promedio)} etiqueta="Ticket promedio" />
      </div>

      <div className="dos-columnas columnas-iguales">
        <form className="card form" onSubmit={cerrar}>
          <div className="card-titulo">
            <div>
              <h3>Cierre de caja</h3>
              <p>Cuenta el efectivo y compáralo con lo registrado.</p>
            </div>
          </div>
          {pendientes.length === 0 ? (
            <Vacio icono="check" titulo="Todo cerrado">No hay ventas pendientes de cierre.</Vacio>
          ) : (
            <>
              <div className="barras">
                {MEDIOS_PAGO.map((m) => (
                  <div key={m} className="barra-item">
                    <div className="barra-item-cab">
                      <span className="capital"><Icono nombre={ICONO_MEDIO[m]} tam={14} /> {m}</span>
                      <strong>{formatoPesos(r.porMedio[m])}</strong>
                    </div>
                    <div className="barra-pista">
                      <div className="barra-relleno" style={{ width: `${r.total ? (r.porMedio[m] / r.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <Campo etiqueta="Efectivo contado en caja (COP)" ayuda={`Esperado: ${formatoPesos(r.porMedio.efectivo)}`}>
                <input type="number" min="0" inputMode="numeric" placeholder="0" value={efectivo} onChange={(e) => setEfectivo(e.target.value)} />
              </Campo>
              {diferencia !== null && (
                <div className={`diferencia ${diferencia === 0 ? "cuadra" : diferencia > 0 ? "sobra" : "falta"}`}>
                  <span>{diferencia === 0 ? "La caja cuadra" : diferencia > 0 ? "Sobra efectivo" : "Falta efectivo"}</span>
                  <strong>{formatoPesos(diferencia)}</strong>
                </div>
              )}
              {error && <Alerta>{error}</Alerta>}
              <button type="submit" className="btn btn-primario btn-grande btn-bloque">
                <Icono nombre="candado" /> Cerrar caja
              </button>
            </>
          )}
        </form>

        <div className="card">
          <div className="card-titulo">
            <div>
              <h3>Platos más vendidos</h3>
              <p>Unidades vendidas en todas las facturas.</p>
            </div>
          </div>
          {top.length === 0 ? (
            <Vacio icono="grafica" titulo="Sin ventas todavía" />
          ) : (
            <ol className="barras ranking">
              {top.map((t, i) => (
                <li key={t.nombre} className="barra-item">
                  <div className="barra-item-cab">
                    <span><span className="puesto">{i + 1}</span>{t.nombre}</span>
                    <strong>{t.cantidad}</strong>
                  </div>
                  <div className="barra-pista">
                    <div className="barra-relleno barra-acento" style={{ width: `${(t.cantidad / maxTop) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <section className="seccion">
        <TituloSeccion titulo="Reporte diario" texto="Ventas agrupadas por día, incluidas las ya cerradas.">
          {facturas.length > 0 && (
            <button className="btn btn-secundario" onClick={() => descargar("ventas.csv", aCSV(facturas))}>
              <Icono nombre="descargar" tam={16} /> Exportar CSV
            </button>
          )}
        </TituloSeccion>
        {dias.length === 0 ? (
          <div className="card">
            <Vacio icono="recibo" titulo="Aún no hay ventas">Cobra un pedido desde «Mesas y pedidos» para verlo aquí.</Vacio>
          </div>
        ) : (
          <div className="card tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th><th className="num">Facturas</th><th className="num">Subtotal</th>
                  <th className="num">Descuentos</th><th className="num">Impuesto</th><th className="num">Propinas</th><th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {dias.map((d) => (
                  <tr key={d.fecha}>
                    <td>{d.fecha}</td><td className="num">{d.cantidad}</td><td className="num">{formatoPesos(d.subtotal)}</td>
                    <td className="num">{formatoPesos(d.descuentos)}</td><td className="num">{formatoPesos(d.impuesto)}</td>
                    <td className="num">{formatoPesos(d.propinas)}</td><td className="num"><strong>{formatoPesos(d.total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {cierres.length > 0 && (
        <section className="seccion">
          <TituloSeccion titulo="Historial de cierres" />
          <div className="card tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th><th>Fecha y hora</th><th>Responsable</th><th className="num">Facturas</th>
                  <th className="num">Total</th><th className="num">Efectivo esperado</th><th className="num">Contado</th><th className="num">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {[...cierres].reverse().map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td><td>{c.fecha} · {c.hora}</td><td>{c.usuario}</td><td className="num">{c.facturas}</td>
                    <td className="num">{formatoPesos(c.total)}</td><td className="num">{formatoPesos(c.efectivoEsperado)}</td>
                    <td className="num">{formatoPesos(c.efectivoContado)}</td>
                    <td className={`num ${c.diferencia < 0 ? "negativo" : c.diferencia > 0 ? "positivo" : ""}`}>{formatoPesos(c.diferencia)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
