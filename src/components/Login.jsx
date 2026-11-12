import { useState } from "react";
import Icono from "./Icono.jsx";
import { Alerta, Campo } from "./ui.jsx";
import { autenticar, registrarCliente } from "../domain/auth.js";

const DEMOS = [
  { usuario: "admin", clave: "Admin123", rol: "Administrador" },
  { usuario: "mesero", clave: "Mesero123", rol: "Mesero" },
  { usuario: "cliente", clave: "Cliente123", rol: "Cliente" },
];

export default function Login({ usuarios, setUsuarios, entrar, botonTema }) {
  const [modo, setModo] = useState("entrar");
  const [form, setForm] = useState({ nombre: "", usuario: "", clave: "" });
  const [error, setError] = useState("");
  const campo = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const registro = modo === "registro";

  function cambiarModo(m) {
    setModo(m);
    setError("");
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");
    if (!registro) {
      const u = await autenticar(usuarios, form.usuario, form.clave);
      return u ? entrar(u) : setError("Usuario o contraseña incorrectos.");
    }
    const r = await registrarCliente(usuarios, form);
    if (r.error) return setError(r.error);
    setUsuarios([...usuarios, r.usuario]);
    entrar(r.usuario);
  }

  return (
    <div className="login">
      <section className="login-arte">
        <div className="marca marca-clara">
          <div className="marca-logo"><Icono nombre="logo" tam={20} /></div>
          <div>
            <div className="marca-nombre">El Sabor</div>
            <div className="marca-sub">Gestión de restaurante</div>
          </div>
        </div>
        <div>
          <h1>Todo el restaurante, en una sola pantalla.</h1>
          <p>Pedidos, reservas, carta y caja conectados para el equipo de sala y la administración.</p>
          <ul className="login-lista">
            <li><span className="login-ic"><Icono nombre="pedidos" /></span>Pedidos por mesa con seguimiento en tiempo real</li>
            <li><span className="login-ic"><Icono nombre="reservas" /></span>Reservas con asignación automática de mesa</li>
            <li><span className="login-ic"><Icono nombre="grafica" /></span>Cierre de caja y reportes de ventas diarios</li>
          </ul>
        </div>
        <small className="login-pie">SIGR · Sistema Integral de Gestión de Restaurante</small>
      </section>

      <section className="login-panel">
        <div className="login-tema">{botonTema}</div>
        <div className="login-caja">
          <h2>{registro ? "Crea tu cuenta" : "Bienvenido de nuevo"}</h2>
          <p className="texto-suave">
            {registro ? "Regístrate como cliente para reservar una mesa." : "Ingresa con tu usuario para continuar."}
          </p>

          <div className="segmento" role="tablist" aria-label="Tipo de acceso">
            <button type="button" role="tab" aria-selected={!registro} className={registro ? "" : "activo"} onClick={() => cambiarModo("entrar")}>
              Iniciar sesión
            </button>
            <button type="button" role="tab" aria-selected={registro} className={registro ? "activo" : ""} onClick={() => cambiarModo("registro")}>
              Soy cliente nuevo
            </button>
          </div>

          <form className="form" onSubmit={enviar}>
            {registro && (
              <Campo etiqueta="Nombre completo">
                <input value={form.nombre} onChange={campo("nombre")} autoComplete="name" placeholder="Ej. Ana Pérez" required />
              </Campo>
            )}
            <Campo etiqueta="Usuario" ayuda={registro ? "De 4 a 20 caracteres: letras minúsculas, números, punto o guion bajo." : null}>
              <input value={form.usuario} onChange={campo("usuario")} autoComplete="username" placeholder="tu.usuario" required />
            </Campo>
            <Campo etiqueta="Contraseña" ayuda={registro ? "Mínimo 8 caracteres, con letras y números." : null}>
              <input
                type="password"
                value={form.clave}
                onChange={campo("clave")}
                autoComplete={registro ? "new-password" : "current-password"}
                placeholder="••••••••"
                required
              />
            </Campo>
            {error && <Alerta>{error}</Alerta>}
            <button type="submit" className="btn btn-primario btn-grande btn-bloque">
              <Icono nombre={registro ? "persona" : "candado"} />
              {registro ? "Crear cuenta y entrar" : "Entrar"}
            </button>
          </form>

          {!registro && (
            <div className="demo">
              <span className="campo-etiqueta">Cuentas de demostración</span>
              <div className="demo-lista">
                {DEMOS.map((d) => (
                  <button
                    key={d.usuario}
                    type="button"
                    className="demo-btn"
                    onClick={() => setForm({ ...form, usuario: d.usuario, clave: d.clave })}
                    title={`Completar con ${d.usuario} / ${d.clave}`}
                  >
                    <strong>{d.rol}</strong>
                    <span>{d.usuario}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
