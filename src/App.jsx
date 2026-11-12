import { useEffect, useState } from "react";
import Login from "./components/Login.jsx";
import Carta from "./components/Carta.jsx";
import Pedidos from "./components/Pedidos.jsx";
import Reservas from "./components/Reservas.jsx";
import Caja from "./components/Caja.jsx";
import Usuarios from "./components/Usuarios.jsx";
import Toasts from "./components/Toasts.jsx";
import useLocalStorage, { borrarTodo } from "./hooks/useLocalStorage.js";
import { puedeVer, VISTAS_POR_ROL } from "./domain/auth.js";
import { CATEGORIAS_INICIAL, MENU_INICIAL, MESAS_INICIAL, USUARIOS_INICIAL } from "./data/seed.js";

const VISTAS = {
  pedidos: { nombre: "Mesas y pedidos", titulo: "Salón principal", texto: "Abre pedidos, envíalos a cocina y cóbralos." },
  carta: { nombre: "Carta", titulo: "Nuestra carta", texto: "Los platos que ofrece el restaurante." },
  reservas: { nombre: "Reservas", titulo: "Reservas", texto: "Reserva una mesa por fecha y hora." },
  caja: { nombre: "Caja y reportes", titulo: "Caja del día", texto: "Ventas, cierre de caja y reportes diarios." },
  usuarios: { nombre: "Usuarios", titulo: "Usuarios", texto: "Cuentas de clientes, meseros y administradores." },
};

export default function App() {
  const [usuarios, setUsuarios] = useLocalStorage("usuarios", USUARIOS_INICIAL);
  const [categorias, setCategorias] = useLocalStorage("categorias", CATEGORIAS_INICIAL);
  const [menu, setMenu] = useLocalStorage("menu", MENU_INICIAL);
  const [mesas] = useLocalStorage("mesas", MESAS_INICIAL);
  const [pedidos, setPedidos] = useLocalStorage("pedidos", []);
  const [reservas, setReservas] = useLocalStorage("reservas", []);
  const [facturas, setFacturas] = useLocalStorage("facturas", []);
  const [cierres, setCierres] = useLocalStorage("cierres", []);
  const [sesion, setSesion] = useLocalStorage("sesion", null);
  const [vista, setVista] = useState(null);
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem("tema") || "claro";
    } catch {
      return "claro";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem("tema", tema);
    } catch {
      /* sin almacenamiento */
    }
  }, [tema]);

  // La sesión guarda solo el id: si el usuario se desactiva o desaparece, se cierra sola.
  const usuario = usuarios.find((u) => u.id === sesion && u.activo) ?? null;
  const vistasRol = usuario ? VISTAS_POR_ROL[usuario.rol] : [];
  const actual = usuario && puedeVer(usuario.rol, vista) ? vista : vistasRol[0];

  function restablecer() {
    if (!window.confirm("¿Restablecer todos los datos de demostración? Se pierden pedidos, reservas y ventas.")) return;
    borrarTodo();
    window.location.reload();
  }

  if (!usuario) {
    return (
      <>
        <Login usuarios={usuarios} setUsuarios={setUsuarios} entrar={(u) => setSesion(u.id)} />
        <Toasts />
      </>
    );
  }

  const info = VISTAS[actual];
  return (
    <div className="app">
      <header className="hero">
        <div className="flotantes" aria-hidden="true">
          <span>🍕</span><span>🥑</span><span>🍋</span><span>🌮</span><span>🍰</span><span>🥂</span>
        </div>
        <div className="topbar">
          <div className="marca">
            <div className="logo">🍴</div>
            <div>
              <h1>El Sabor</h1>
              <small>SIGR</small>
            </div>
          </div>
          <div className="acciones">
            <nav>
              {vistasRol.map((v) => (
                <button key={v} className={actual === v ? "activo" : ""} onClick={() => setVista(v)}>
                  {VISTAS[v].nombre}
                </button>
              ))}
            </nav>
            <button className="tema" title="Cambiar tema" onClick={() => setTema(tema === "claro" ? "oscuro" : "claro")}>
              {tema === "claro" ? "🌙" : "☀️"}
            </button>
            <button className="chip salir" onClick={() => setSesion(null)} title="Cerrar sesión">
              {usuario.nombre} · {usuario.rol} ⎋
            </button>
          </div>
        </div>
        <div className="hero-texto">
          <h2>{info.titulo}</h2>
          <p>{info.texto}</p>
        </div>
      </header>
      <main>
        {actual === "carta" && (
          <Carta usuario={usuario} categorias={categorias} setCategorias={setCategorias} menu={menu} setMenu={setMenu} />
        )}
        {actual === "pedidos" && (
          <Pedidos
            usuario={usuario}
            mesas={mesas}
            menu={menu}
            categorias={categorias}
            pedidos={pedidos}
            setPedidos={setPedidos}
            facturas={facturas}
            setFacturas={setFacturas}
          />
        )}
        {actual === "reservas" && (
          <Reservas usuario={usuario} mesas={mesas} reservas={reservas} setReservas={setReservas} />
        )}
        {actual === "caja" && (
          <Caja usuario={usuario} facturas={facturas} setFacturas={setFacturas} cierres={cierres} setCierres={setCierres} />
        )}
        {actual === "usuarios" && <Usuarios usuarios={usuarios} setUsuarios={setUsuarios} yo={usuario} />}
      </main>
      <Toasts />
      <footer className="pie">
        <span>Datos guardados en este navegador · SIGR v1.0.0</span>
        {usuario.rol === "admin" && (
          <button className="chip" onClick={restablecer}>Restablecer datos de demo</button>
        )}
      </footer>
    </div>
  );
}
