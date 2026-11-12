import { useState } from "react";
import Icono from "./Icono.jsx";
import { Alerta, Campo, Insignia, TituloSeccion, Vacio } from "./ui.jsx";
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
    setError("");
    setForm({ nombre: p.nombre, categoriaId: p.categoriaId, precio: p.precio, emoji: p.emoji });
    document.getElementById("form-plato")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function agregarCategoria(e) {
    e.preventDefault();
    const nombre = nuevaCategoria.trim();
    if (!nombre) return;
    if (categorias.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) return mostrarToast("Esa categoría ya existe", "aviso");
    setCategorias([...categorias, { id: Math.max(0, ...categorias.map((c) => c.id)) + 1, nombre }]);
    setNuevaCategoria("");
    mostrarToast(`Categoría "${nombre}" creada`);
  }

  function quitarCategoria(c) {
    if (categoriaEnUso(menu, c.id)) return mostrarToast(`"${c.nombre}" tiene platos; muévelos o elimínalos antes`, "aviso");
    setCategorias(categorias.filter((x) => x.id !== c.id));
    if (filtro === c.id) setFiltro(0);
  }

  return (
    <>
      <div className="barra-filtros">
        <label className="campo-con-icono buscar">
          <span className="sr-only">Buscar plato</span>
          <Icono nombre="buscar" tam={16} />
          <input type="search" placeholder="Buscar plato…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>
        <div className="tabs" role="tablist" aria-label="Filtrar por categoría">
          <button role="tab" aria-selected={filtro === 0} className={`tab ${filtro === 0 ? "activo" : ""}`} onClick={() => setFiltro(0)}>
            Todas <span className="tab-num">{menu.filter((p) => esAdmin || p.activo).length}</span>
          </button>
          {categorias.map((c) => (
            <button key={c.id} role="tab" aria-selected={filtro === c.id} className={`tab ${filtro === c.id ? "activo" : ""}`} onClick={() => setFiltro(c.id)}>
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="card">
          <Vacio icono="buscar" titulo="No encontramos platos">Prueba con otra búsqueda o categoría.</Vacio>
        </div>
      ) : (
        <div className="platos">
          {visibles.map((p) => (
            <article key={p.id} className={`card plato ${p.activo ? "" : "inactivo"}`}>
              <div className="plato-img">
                <span aria-hidden="true">{p.emoji}</span>
                {!p.activo && <Insignia tono="neutro">Oculto</Insignia>}
              </div>
              <div className="plato-cuerpo">
                <span className="plato-cat">{nombreCategoria(categorias, p.categoriaId)}</span>
                <h3>{p.nombre}</h3>
                <span className="precio">{formatoPesos(p.precio)}</span>
              </div>
              {esAdmin && (
                <div className="plato-admin">
                  <button className="btn btn-fantasma btn-icono btn-icono-sm" onClick={() => editar(p)} title="Editar" aria-label={`Editar ${p.nombre}`}>
                    <Icono nombre="editar" tam={16} />
                  </button>
                  <button
                    className="btn btn-fantasma btn-icono btn-icono-sm"
                    onClick={() => setMenu(menu.map((x) => (x.id === p.id ? { ...x, activo: !x.activo } : x)))}
                    title={p.activo ? "Ocultar de la carta" : "Mostrar en la carta"}
                    aria-label={p.activo ? `Ocultar ${p.nombre}` : `Mostrar ${p.nombre}`}
                  >
                    <Icono nombre={p.activo ? "ocultar" : "ver"} tam={16} />
                  </button>
                  <button
                    className="btn btn-fantasma btn-icono btn-icono-sm btn-icono-peligro"
                    title="Eliminar"
                    aria-label={`Eliminar ${p.nombre}`}
                    onClick={() => {
                      if (!window.confirm(`¿Eliminar "${p.nombre}" de la carta?`)) return;
                      setMenu(menu.filter((x) => x.id !== p.id));
                      mostrarToast(`${p.nombre} eliminado`, "aviso");
                    }}
                  >
                    <Icono nombre="borrar" tam={16} />
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {esAdmin && (
        <section className="seccion">
          <TituloSeccion titulo="Administrar la carta" texto="Solo el administrador ve esta sección." />
          <div className="dos-columnas columnas-iguales">
            <form id="form-plato" className={`card form ${editando ? "editando" : ""}`} onSubmit={guardar}>
              <div className="card-titulo">
                <div>
                  <h3>{editando ? "Editar plato" : "Nuevo plato"}</h3>
                  <p>{editando ? "Los cambios no afectan pedidos ya registrados." : "Aparecerá de inmediato en la carta."}</p>
                </div>
                <span className="emoji-vista" aria-hidden="true">{form.emoji || "🍴"}</span>
              </div>
              <Campo etiqueta="Nombre del plato">
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Arroz con coco" />
              </Campo>
              <Campo etiqueta="Categoría">
                <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </Campo>
              <div className="fila-campos">
                <Campo etiqueta="Precio (COP)">
                  <input type="number" min="0" step="500" inputMode="numeric" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="15000" />
                </Campo>
                <Campo etiqueta="Ícono" ayuda="Un emoji">
                  <input maxLength={4} value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
                </Campo>
              </div>
              {error && <Alerta>{error}</Alerta>}
              <div className="botones">
                {editando && <button type="button" className="btn btn-secundario" onClick={cancelar}>Cancelar</button>}
                <button type="submit" className="btn btn-primario">
                  <Icono nombre={editando ? "check" : "mas"} tam={16} /> {editando ? "Guardar cambios" : "Agregar plato"}
                </button>
              </div>
            </form>

            <form className="card form" onSubmit={agregarCategoria}>
              <div className="card-titulo">
                <div>
                  <h3>Categorías</h3>
                  <p>Una categoría con platos no se puede eliminar.</p>
                </div>
              </div>
              <ul className="categorias">
                {categorias.map((c) => {
                  const total = menu.filter((p) => p.categoriaId === c.id).length;
                  return (
                    <li key={c.id}>
                      <span>{c.nombre}</span>
                      <span className="texto-suave texto-sm">{total} {total === 1 ? "plato" : "platos"}</span>
                      <button
                        type="button"
                        className="btn btn-fantasma btn-icono btn-icono-sm btn-icono-peligro"
                        aria-label={`Eliminar categoría ${c.nombre}`}
                        title="Eliminar categoría"
                        onClick={() => quitarCategoria(c)}
                      >
                        <Icono nombre="borrar" tam={15} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Campo etiqueta="Nueva categoría">
                <div className="codigo">
                  <input value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} placeholder="Ej. Sopas" />
                  <button type="submit" className="btn btn-secundario" disabled={!nuevaCategoria.trim()}>
                    <Icono nombre="mas" tam={16} /> Agregar
                  </button>
                </div>
              </Campo>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
