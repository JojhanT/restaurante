import { useState } from "react";
import { autenticar, registrarCliente } from "../domain/auth.js";

export default function Login({ usuarios, setUsuarios, entrar }) {
  const [modo, setModo] = useState("entrar");
  const [form, setForm] = useState({ nombre: "", usuario: "", clave: "" });
  const [error, setError] = useState("");
  const campo = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setError("");
    if (modo === "entrar") {
      const u = await autenticar(usuarios, form.usuario, form.clave);
      return u ? entrar(u) : setError("Usuario o contraseña incorrectos");
    }
    const r = await registrarCliente(usuarios, form);
    if (r.error) return setError(r.error);
    setUsuarios([...usuarios, r.usuario]);
    entrar(r.usuario);
  }

  return (
    <div className="login">
      <form className="card form" onSubmit={enviar}>
        <div className="marca-login">🍴</div>
        <h2>El Sabor · SIGR</h2>
        <p className="suave">{modo === "entrar" ? "Inicia sesión para continuar" : "Crea tu cuenta de cliente"}</p>
        {modo === "registro" && (
          <input placeholder="Nombre completo" value={form.nombre} onChange={campo("nombre")} autoComplete="name" />
        )}
        <input placeholder="Usuario" value={form.usuario} onChange={campo("usuario")} autoComplete="username" />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.clave}
          onChange={campo("clave")}
          autoComplete={modo === "entrar" ? "current-password" : "new-password"}
        />
        <button type="submit">{modo === "entrar" ? "Entrar" : "Registrarme"}</button>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="button" className="chip" onClick={() => { setModo(modo === "entrar" ? "registro" : "entrar"); setError(""); }}>
          {modo === "entrar" ? "Soy cliente nuevo" : "Ya tengo cuenta"}
        </button>
        {modo === "entrar" && (
          <small className="suave">
            Demo: admin / Admin123 · mesero / Mesero123 · cliente / Cliente123
          </small>
        )}
      </form>
    </div>
  );
}
