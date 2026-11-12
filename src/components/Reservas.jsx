import { useState } from "react";
import Icono from "./Icono.jsx";
import { Alerta, Campo, ETIQUETA_RESERVA, Insignia, Kpi, TONO_RESERVA, TituloSeccion, Vacio } from "./ui.jsx";
import { APERTURA, crearReserva, ULTIMA_RESERVA } from "../domain/reservas.js";
import { fechaISO } from "../domain/format.js";
import { mostrarToast } from "../utils/toast.js";

const fecha = (iso, opciones) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-CO", opciones).replace(".", "");
const fechaLarga = (iso) => fecha(iso, { weekday: "long", day: "numeric", month: "long" });

export default function Reservas({ usuario, mesas, reservas, setReservas }) {
  const personal = usuario.rol !== "cliente";
  const hoy = fechaISO();
  const [form, setForm] = useState({ nombre: personal ? "" : usuario.nombre, fecha: hoy, hora: "19:00", personas: 2 });
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("proximas");
  const campo = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const propias = reservas.filter((r) => personal || r.clienteId === usuario.id);
  const lista = propias
    .filter((r) => filtro === "todas" || (r.fecha >= hoy && r.estado !== "cancelada"))
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));
  const deHoy = propias.filter((r) => r.fecha === hoy && r.estado !== "cancelada");

  function reservar(e) {
    e.preventDefault();
    const r = crearReserva({ ...form, personas: Number(form.personas), clienteId: usuario.id }, { mesas, reservas });
    if (r.error) return setError(r.error);
    setReservas([...reservas, r.reserva]);
    setError("");
    mostrarToast(`Reserva #${r.reserva.id} creada en la mesa ${r.reserva.mesaId}`);
  }

  function cambiar(r, estado) {
    if (estado === "cancelada" && !window.confirm(`¿Cancelar la reserva de ${r.nombre} del ${fechaLarga(r.fecha)} a las ${r.hora}?`)) return;
    setReservas(reservas.map((x) => (x.id === r.id ? { ...x, estado } : x)));
    mostrarToast(`Reserva #${r.id} ${ETIQUETA_RESERVA[estado].toLowerCase()}`, estado === "cancelada" ? "aviso" : "ok");
  }

  return (
    <>
      {personal && (
        <div className="kpis">
          <Kpi icono="reservas" tono="primario" valor={deHoy.length} etiqueta="Reservas para hoy" />
          <Kpi icono="persona" tono="info" valor={deHoy.reduce((a, r) => a + r.personas, 0)} etiqueta="Comensales esperados hoy" />
          <Kpi icono="reloj" tono="aviso" valor={propias.filter((r) => r.estado === "pendiente" && r.fecha >= hoy).length} etiqueta="Por confirmar" />
        </div>
      )}

      <div className="dos-columnas columnas-form">
        <form className="card form" onSubmit={reservar}>
          <div className="card-titulo">
            <div>
              <h3>Nueva reserva</h3>
              <p>Cada reserva aparta la mesa durante 2 horas.</p>
            </div>
          </div>
          <Campo etiqueta="Nombre de quien reserva">
            <input value={form.nombre} onChange={campo("nombre")} placeholder="Ej. Familia Gómez" />
          </Campo>
          <div className="fila-campos">
            <Campo etiqueta="Fecha">
              <input type="date" min={hoy} value={form.fecha} onChange={campo("fecha")} />
            </Campo>
            <Campo etiqueta="Hora" ayuda={`De ${APERTURA} a ${ULTIMA_RESERVA}`}>
              <input type="time" min={APERTURA} max={ULTIMA_RESERVA} step="900" value={form.hora} onChange={campo("hora")} />
            </Campo>
          </div>
          <Campo etiqueta="Número de personas">
            <div className="stepper stepper-grande">
              <button type="button" onClick={() => setForm({ ...form, personas: Math.max(1, Number(form.personas) - 1) })} aria-label="Una persona menos">
                <Icono nombre="menos" tam={16} />
              </button>
              <input type="number" min="1" value={form.personas} onChange={campo("personas")} aria-label="Personas" />
              <button type="button" onClick={() => setForm({ ...form, personas: Number(form.personas) + 1 })} aria-label="Una persona más">
                <Icono nombre="mas" tam={16} />
              </button>
            </div>
          </Campo>
          {error && <Alerta>{error}</Alerta>}
          <button type="submit" className="btn btn-primario btn-grande btn-bloque">
            <Icono nombre="reservas" /> Reservar mesa
          </button>
        </form>

        <section>
          <TituloSeccion titulo={personal ? "Agenda de reservas" : "Mis reservas"}>
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={filtro === "proximas"} className={`tab ${filtro === "proximas" ? "activo" : ""}`} onClick={() => setFiltro("proximas")}>Próximas</button>
              <button role="tab" aria-selected={filtro === "todas"} className={`tab ${filtro === "todas" ? "activo" : ""}`} onClick={() => setFiltro("todas")}>Todas</button>
            </div>
          </TituloSeccion>
          {lista.length === 0 ? (
            <div className="card">
              <Vacio icono="reservas" titulo={filtro === "proximas" ? "No hay reservas próximas" : "Aún no hay reservas"}>
                Usa el formulario para apartar una mesa.
              </Vacio>
            </div>
          ) : (
            <ul className="reservas">
              {lista.map((r) => (
                <li key={r.id} className={`card reserva ${r.estado}`}>
                  <div className="reserva-fecha" title={fechaLarga(r.fecha)}>
                    <span>{fecha(r.fecha, { weekday: "short" })}</span>
                    <strong>{fecha(r.fecha, { day: "numeric" })}</strong>
                    <span>{fecha(r.fecha, { month: "short" })}</span>
                  </div>
                  <div className="reserva-info">
                    <strong>{r.nombre}</strong>
                    <span className="reserva-hora"><Icono nombre="reloj" tam={13} /> {r.hora}</span>
                    <span className="texto-suave texto-sm">
                      <Icono nombre="persona" tam={13} /> {r.personas} {r.personas === 1 ? "persona" : "personas"} · Mesa {r.mesaId} · #{r.id}
                    </span>
                  </div>
                  <Insignia tono={TONO_RESERVA[r.estado]}>{ETIQUETA_RESERVA[r.estado]}</Insignia>
                  <div className="acciones">
                    {personal && r.estado === "pendiente" && (
                      <button className="btn btn-secundario btn-sm" onClick={() => cambiar(r, "confirmada")}>
                        <Icono nombre="check" tam={14} /> Confirmar
                      </button>
                    )}
                    {r.estado !== "cancelada" && (
                      <button className="btn btn-fantasma btn-sm" onClick={() => cambiar(r, "cancelada")}>Cancelar</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
