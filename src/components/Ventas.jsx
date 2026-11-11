import { formatoPesos } from "../utils/cuenta.js";

export default function Ventas({ ventas, limpiar }) {
  const totalVendido = ventas.reduce((acc, v) => acc + v.cuenta.total, 0);
  const totalPropinas = ventas.reduce((acc, v) => acc + v.cuenta.propina, 0);
  const promedio = ventas.length ? Math.round(totalVendido / ventas.length) : 0;

  return (
    <section>
      <div className="stats">
        <div className="card stat">
          <div className="ico">🧾</div>
          <div><strong>{ventas.length}</strong><span>Facturas emitidas</span></div>
        </div>
        <div className="card stat">
          <div className="ico">💵</div>
          <div><strong>{formatoPesos(totalVendido)}</strong><span>Total vendido</span></div>
        </div>
        <div className="card stat">
          <div className="ico">🎁</div>
          <div><strong>{formatoPesos(totalPropinas)}</strong><span>Propinas</span></div>
        </div>
        <div className="card stat">
          <div className="ico">📊</div>
          <div><strong>{formatoPesos(promedio)}</strong><span>Ticket promedio</span></div>
        </div>
      </div>

      <div className="seccion-titulo">
        <h2>Historial de ventas</h2>
        {ventas.length > 0 && (
          <button className="chip" onClick={limpiar}>Limpiar historial</button>
        )}
      </div>

      {ventas.length === 0 ? (
        <div className="card vacio">Aún no hay ventas. Cobra un pedido desde "Mesas y pedidos".</div>
      ) : (
        <div className="card tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Hora</th>
                <th>Mesa</th>
                <th>Platos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.hora}</td>
                  <td>Mesa {v.mesa}</td>
                  <td>{v.platos}</td>
                  <td><strong>{formatoPesos(v.cuenta.total)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
