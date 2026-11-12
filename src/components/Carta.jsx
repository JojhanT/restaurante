import { useState } from "react";
import { categoriaEnUso, nombreCategoria, validarPlato } from "../domain/menu.js";
import { formatoPesos } from "../domain/format.js";
import { mostrarToast } from "../utils/toast.js";

const VACIO = { nombre: "", categoriaId: "", precio: "", emoji: "🍴" };

export default function Carta({ usuario, categorias, setCategorias, menu, setMenu }) {
  const esAdmin = usuario.rol === "admin";
  const [filtro, setFiltro] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({ ...VACIO, categoriaId: categorias[0]?.id ?? "" });
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  const visibles = menu
    .filter((p) => esAdmin || p.activo)
    .filter((p) => !filtro || p.categoriaId === filtro)
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));

  function guardar(e) {
    e.preventDefault();
    const datos = { ...form, categoriaId: Number(form.categoriaId), precio: Number(form.precio), nombre: form.nombre.trim() };
    const falla = validarPlato(datos, menu, editando);
    if (falla) return setError(falla);
    if (editando) {
      setMenu(menu.map((p) => (p.id === editando ? { ...p, ...datos } : p)));
      mostrarToast(`"${datos.nombre}" actualizado`);
    } else {
      const id = Math.max(0, ...menu.map((p) => p.id)) + 1;
      setMenu([...menu, { id, ...datos, activo: true }]);
      mostrarToast(`"${datos.nombre}" añadido a la carta`);
    }
    cancelar();
  }

  function cancelar() {
    setEditando(null);
    setError("");
    setForm({ ...VACIO, categoriaId: categorias[0]?.id ?? "" });
  }

  function editar(p) {
    setEditando(p.id);
    setForm({ nombre: p.nombre, categoriaId: p.categoriaId, precio: p.precio, emoji: p.emoji });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function agregarCategoria(e) {
    e.preventDefault();
    const nombre = nuevaCategoria.trim();
    if (!nombre) return;
    if (categorias.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) return mostrarToast("Esa categoría ya existe", "aviso");
    setCategorias([...categorias, { id: Math.max(0, ...categorias.map((c) => c.id)) + 1, nombre }]);
    setNuevaCategoria("");
  }

  function quitarCategoria(c) {
    if (categoriaEnUso(menu, c.id)) return mostrarToast(`"${c.nombre}" tiene platos; muévelos o elimínalos antes`, "aviso");
    setCategorias(categorias.filter((x) => x.id !== c.id));
    if (filtro === c.id) setFiltro(0);
  }

  return (
    <section>
      <div className="seccion-titulo">
        <h2>Platos ({visibles.length})</h2>
      </div>
      <div className="buscador">
        <input placeholder="🔍 Buscar plato..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>
      <div className="filtros">
        <button className={filtro === 0 ? "chip activo" : "chip"} onClick={() => setFiltro(0)}>Todas</button>
        {categorias.map((c) => (
          <button key={c.id} className={filtro === c.id ? "chip activo" : "chip"} onClick={() => setFiltro(c.id)}>
            {c.nombre}
          </button>
        ))}
      </div>

      <div className="grid">
        {visibles.map((p) => (
          <article key={p.id} className={`card plato ${p.activo ? "" : "inactivo"}`}>
            <div className="emoji">{p.emoji}</div>
            <div className="cuerpo">
              <small>{nombreCategoria(categorias, p.categoriaId)}{p.activo ? "" : " · oculto"}</small>
              <h3>{p.nombre}</h3>
              <strong>{formatoPesos(p.precio)}</strong>
              {esAdmin && (
                <div className="acciones-plato">
                  <button className="chip" onClick={() => editar(p)}>Editar</button>
                  <button className="chip" onClick={() => setMenu(menu.map((x) => (x.id === p.id ? { ...x, activo: !x.activo } : x)))}>
                    {p.activo ? "Ocultar" : "Mostrar"}
                  </button>
                  <button
                    className="peligro"
                    onClick={() => {
                      if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
                      setMenu(menu.filter((x) => x.id !== p.id));
                      mostrarToast(`${p.nombre} eliminado`, "aviso");
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
        {visibles.length === 0 && <div className="card vacio">No hay platos para mostrar.</div>}
      </div>

      {esAdmin && (
        <div className="dos-columnas admin-menu">
          <form className="card form" onSubmit={guardar}>
            <h3>{editando ? "Editar plato" : "Agregar plato"}</h3>
            <input placeholder="Nombre del plato" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <input type="number" min="0" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
            <input placeholder="Emoji" maxLength={4} value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
            <button type="submit">{editando ? "Guardar cambios" : "Agregar"}</button>
            {editando && <button type="button" className="chip" onClick={cancelar}>Cancelar edición</button>}
            {error && <p className="error">{error}</p>}
          </form>

          <form className="card form" onSubmit={agregarCategoria}>
            <h3>Categorías</h3>
            <div className="filtros">
              {categorias.map((c) => (
                <span key={c.id} className="chip etiqueta">
                  {c.nombre} <button type="button" aria-label={`Eliminar ${c.nombre}`} onClick={() => quitarCategoria(c)}>×</button>
                </span>
              ))}
            </div>
            <input placeholder="Nueva categoría" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} />
            <button type="submit" disabled={!nuevaCategoria.trim()}>Agregar categoría</button>
          </form>
        </div>
      )}
    </section>
  );
}
