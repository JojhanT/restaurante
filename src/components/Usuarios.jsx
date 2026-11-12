import Icono from "./Icono.jsx";
import { iniciales, Insignia, Kpi } from "./ui.jsx";
import { NOMBRE_ROL } from "../domain/auth.js";
import { mostrarToast } from "../utils/toast.js";

const ROLES = ["cliente", "mesero", "admin"];

export default function Usuarios({ usuarios, setUsuarios, yo }) {
  const cambiar = (id, cambios) => setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, ...cambios } : u)));
  const cuenta = (rol) => usuarios.filter((u) => u.rol === rol && u.activo).length;

  function cambiarRol(u, rol) {
    if (u.rol === "admin" && cuenta("admin") === 1) return mostrarToast("Debe quedar al menos un administrador", "aviso");
    cambiar(u.id, { rol });
    mostrarToast(`${u.nombre} ahora es ${NOMBRE_ROL[rol].toLowerCase()}`);
  }

  function alternar(u) {
    if (u.id === yo.id) return mostrarToast("No puedes desactivar tu propia cuenta", "aviso");
    cambiar(u.id, { activo: !u.activo });
    mostrarToast(`${u.nombre} ${u.activo ? "desactivado" : "activado"}`, u.activo ? "aviso" : "ok");
  }

  return (
    <>
      <div className="kpis">
        <Kpi icono="candado" tono="primario" valor={cuenta("admin")} etiqueta="Administradores" />
        <Kpi icono="pedidos" tono="info" valor={cuenta("mesero")} etiqueta="Meseros" />
        <Kpi icono="persona" tono="ok" valor={cuenta("cliente")} etiqueta="Clientes" />
      </div>
      <div className="card tabla-wrap">
        <table className="tabla">
          <thead>
            <tr><th>Persona</th><th>Rol</th><th>Estado</th><th className="num">Acción</th></tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className={u.activo ? "" : "fila-inactiva"}>
                <td>
                  <div className="persona">
                    <span className="avatar">{iniciales(u.nombre)}</span>
                    <div>
                      <strong>{u.nombre}{u.id === yo.id && <span className="texto-suave"> (tú)</span>}</strong>
                      <small>@{u.usuario}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <select className="select-compacto" value={u.rol} onChange={(e) => cambiarRol(u, e.target.value)} aria-label={`Rol de ${u.nombre}`}>
                    {ROLES.map((r) => <option key={r} value={r}>{NOMBRE_ROL[r]}</option>)}
                  </select>
                </td>
                <td><Insignia tono={u.activo ? "ok" : "neutro"}>{u.activo ? "Activo" : "Inactivo"}</Insignia></td>
                <td className="num">
                  <button className={`btn btn-sm ${u.activo ? "btn-fantasma" : "btn-secundario"}`} onClick={() => alternar(u)} disabled={u.id === yo.id}>
                    <Icono nombre={u.activo ? "cerrar" : "check"} tam={14} /> {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
