import { useState } from "react";
import { CATEGORIAS } from "../data/mock.js";
import { formatoPesos } from "../utils/cuenta.js";
import { mostrarToast } from "../utils/toast.js";

export default function Menu({ menu, setMenu }) {
  const [filtro, setFiltro] = useState("Todas");
  const [form, setForm] = useState({ nombre: "", categoria: CATEGORIAS[0], precio: "" });
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const visibles = menu
    .filter((p) => filtro === "Todas" || p.categoria === filtro)
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));

  function agregar(e) {
    e.preventDefault();
    const precio = Number(form.precio);
    if (!form.nombre.trim()) return setError("El nombre es obligatorio");
    if (!(precio > 0)) return setError("El precio debe ser mayor a 0");
    const id = Math.max(0, ...menu.map((p) => p.id)) + 1;
    setMenu([...menu, { id, nombre: form.nombre.trim(), categoria: form.categoria, precio, emoji: "🍴" }]);
    mostrarToast(`"${form.nombre.trim()}" añadido a la carta`);
    setForm({ ...form, nombre: "", precio: "" });
    setError("");
  }

  return (
    <section>
      <div className="seccion-titulo">
        <h2>Platos ({visibles.length})</h2>
      </div>
      <div className="buscador">
        <input
          placeholder="🔍 Buscar plato..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className="filtros">
        {["Todas", ...CATEGORIAS].map((c) => (
          <button key={c} className={filtro === c ? "chip activo" : "chip"} onClick={() => setFiltro(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid">
        {visibles.map((p) => (
          <article key={p.id} className="card plato">
            <div className="emoji">{p.emoji}</div>
            <div className="cuerpo">
              <small>{p.categoria}</small>
              <h3>{p.nombre}</h3>
              <strong>{formatoPesos(p.precio)}</strong>
              <button className="peligro" onClick={() => {
                  setMenu(menu.filter((x) => x.id !== p.id));
                  mostrarToast(`${p.nombre} eliminado`, "aviso");
                }}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <form className="card form" onSubmit={agregar}>
        <h3>Agregar plato</h3>
        <input
          placeholder="Nombre del plato"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
          {CATEGORIAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Precio"
          value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
        />
        <button type="submit">Agregar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </section>
  );
}
