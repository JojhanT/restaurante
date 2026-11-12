import { mostrarToast } from "../utils/toast.js";

const ROLES = ["cliente", "mesero", "admin"];

export default function Usuarios({ usuarios, setUsuarios, yo }) {
  const cambiar = (id, cambios) => setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, ...cambios } : u)));

  function cambiarRol(u, rol) {
    const admins = usuarios.filter((x) => x.rol === "admin" && x.activo).length;
    if (u.rol === "admin" && admins === 1) return mostrarToast("Debe quedar al menos un administrador", "aviso");
    cambiar(u.id, { rol });
  }

  function alternar(u) {
    if (u.id === yo.id) return mostrarToast("No puedes desactivar tu propia cuenta", "aviso");
    cambiar(u.id, { activo: !u.activo });
  }

  return (
    <section className="card tabla-wrap">
      <table className="tabla">
        <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.usuario}</td>
              <td>
                <select value={u.rol} onChange={(e) => cambiarRol(u, e.target.value)} aria-label={`Rol de ${u.usuario}`}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </td>
              <td><span className={`badge ${u.activo ? "confirmada" : "cancelada"}`}>{u.activo ? "activo" : "inactivo"}</span></td>
              <td><button className="chip" onClick={() => alternar(u)}>{u.activo ? "Desactivar" : "Activar"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
