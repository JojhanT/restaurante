import { useState } from "react";
import { crearReserva } from "../domain/reservas.js";
import { fechaISO } from "../domain/format.js";
import { mostrarToast } from "../utils/toast.js";

export default function Reservas({ usuario, mesas, reservas, setReservas }) {
  const personal = usuario.rol !== "cliente";
  const [form, setForm] = useState({ nombre: personal ? "" : usuario.nombre, fecha: fechaISO(), hora: "19:00", personas: 2 });
  const [error, setError] = useState("");
  const campo = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const lista = reservas
    .filter((r) => personal || r.clienteId === usuario.id)
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));

  function reservar(e) {
    e.preventDefault();
    const r = crearReserva({ ...form, personas: Number(form.personas), clienteId: usuario.id }, { mesas, reservas });
    if (r.error) return setError(r.error);
    setReservas([...reservas, r.reserva]);
    setError("");
    mostrarToast(`Reserva #${r.reserva.id} creada: mesa ${r.reserva.mesaId}`);
  }

  const cambiar = (id, estado) => setReservas(reservas.map((r) => (r.id === id ? { ...r, estado } : r)));

  return (
    <section className="dos-columnas">
      <form className="card form" onSubmit={reservar}>
        <h3>Nueva reserva</h3>
        <input placeholder="Nombre de quien reserva" value={form.nombre} onChange={campo("nombre")} />
        <input type="date" min={fechaISO()} value={form.fecha} onChange={campo("fecha")} aria-label="Fecha" />
        <input type="time" value={form.hora} onChange={campo("hora")} aria-label="Hora" />
        <input type="number" min="1" value={form.personas} onChange={campo("personas")} aria-label="Personas" />
        <button type="submit">Reservar</button>
        {error && <p className="error" role="alert">{error}</p>}
        <small className="suave">Reservas de 12:00 a 21:00. Cada reserva ocupa la mesa 2 horas.</small>
      </form>

      <div>
        <h2>{personal ? "Todas las reservas" : "Mis reservas"}</h2>
        {lista.length === 0 ? (
          <div className="card vacio">Aún no hay reservas.</div>
        ) : (
          <div className="card tabla-wrap">
            <table className="tabla">
              <thead>
                <tr><th>#</th><th>Fecha</th><th>Hora</th><th>Nombre</th><th>Pers.</th><th>Mesa</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {lista.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td><td>{r.fecha}</td><td>{r.hora}</td><td>{r.nombre}</td><td>{r.personas}</td><td>{r.mesaId}</td>
                    <td><span className={`badge ${r.estado}`}>{r.estado}</span></td>
                    <td className="acciones-fila">
                      {personal && r.estado === "pendiente" && <button className="chip" onClick={() => cambiar(r.id, "confirmada")}>Confirmar</button>}
                      {r.estado !== "cancelada" && <button className="chip" onClick={() => cambiar(r.id, "cancelada")}>Cancelar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
