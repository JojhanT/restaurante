import { useEffect, useState } from "react";
import Login from "./components/Login.jsx";
import Carta from "./components/Carta.jsx";
import Pedidos from "./components/Pedidos.jsx";
import Reservas from "./components/Reservas.jsx";
import Caja from "./components/Caja.jsx";
import Usuarios from "./components/Usuarios.jsx";
import Toasts from "./components/Toasts.jsx";
import Icono from "./components/Icono.jsx";
import { iniciales } from "./components/ui.jsx";
import useLocalStorage, { borrarTodo } from "./hooks/useLocalStorage.js";
import { NOMBRE_ROL, puedeVer, VISTAS_POR_ROL } from "./domain/auth.js";
import { CATEGORIAS_INICIAL, MENU_INICIAL, MESAS_INICIAL, USUARIOS_INICIAL } from "./data/seed.js";

const VISTAS = {
  pedidos: {
    nombre: "Mesas y pedidos", corto: "Pedidos", icono: "pedidos", seccion: "Operación",
    titulo: "Salón principal", texto: "Abre pedidos por mesa, envíalos a cocina y cóbralos cuando estén servidos.",
  },
  carta: {
    nombre: "Carta", corto: "Carta", icono: "carta", seccion: "Menú digital",
    titulo: "Nuestra carta", texto: "Platos y categorías que ofrece el restaurante.",
  },
  reservas: {
    nombre: "Reservas", corto: "Reservas", icono: "reservas", seccion: "Clientes",
    titulo: "Reservas", texto: "Aparta una mesa por fecha y hora. La mesa se asigna sola según el número de personas.",
  },
  caja: {
    nombre: "Caja y reportes", corto: "Caja", icono: "caja", seccion: "Finanzas",
    titulo: "Caja del día", texto: "Ventas pendientes de cierre, cierre de caja y reportes diarios.",
  },
  usuarios: {
    nombre: "Usuarios", corto: "Usuarios", icono: "usuarios", seccion: "Administración",
    titulo: "Usuarios y permisos", texto: "Cuentas de clientes, meseros y administradores.",
  },
};

function temaInicial() {
  try {
    const guardado = localStorage.getItem("tema");
    if (guardado) return guardado;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
  } catch {
    return "claro";
  }
}

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
  const [tema, setTema] = useState(temaInicial);

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

  useEffect(() => {
    document.title = usuario ? `${VISTAS[actual].nombre} · El Sabor` : "Iniciar sesión · El Sabor";
  }, [usuario, actual]);

  function restablecer() {
    if (!window.confirm("¿Restablecer todos los datos de demostración? Se pierden pedidos, reservas y ventas.")) return;
    borrarTodo();
    window.location.reload();
  }

  const botonTema = (
    <button
      className="btn btn-fantasma btn-icono"
      onClick={() => setTema(tema === "claro" ? "oscuro" : "claro")}
      title={tema === "claro" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      aria-label={tema === "claro" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
    >
      <Icono nombre={tema === "claro" ? "luna" : "sol"} />
    </button>
  );

  if (!usuario) {
    return (
      <>
        <Login usuarios={usuarios} setUsuarios={setUsuarios} entrar={(u) => setSesion(u.id)} botonTema={botonTema} />
        <Toasts />
      </>
    );
  }

  const info = VISTAS[actual];
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-interior">
          <div className="marca">
            <div className="marca-logo"><Icono nombre="logo" tam={20} /></div>
            <div>
              <div className="marca-nombre">El Sabor</div>
              <div className="marca-sub">Gestión de restaurante</div>
            </div>
          </div>
          <nav className="nav" aria-label="Secciones">
            {vistasRol.map((v) => (
              <button
                key={v}
                className={`nav-item ${actual === v ? "activo" : ""}`}
                onClick={() => setVista(v)}
                aria-current={actual === v ? "page" : undefined}
              >
                <Icono nombre={VISTAS[v].icono} />
                <span className="nav-largo">{VISTAS[v].nombre}</span>
                <span className="nav-corto">{VISTAS[v].corto}</span>
              </button>
            ))}
          </nav>
          <div className="usuario">
            {botonTema}
            <div className="avatar" aria-hidden="true">{iniciales(usuario.nombre)}</div>
            <div className="usuario-datos">
              <span className="usuario-nombre">{usuario.nombre}</span>
              <span className="usuario-rol">{NOMBRE_ROL[usuario.rol]}</span>
            </div>
            <button className="btn btn-fantasma btn-icono" onClick={() => setSesion(null)} title="Cerrar sesión" aria-label="Cerrar sesión">
              <Icono nombre="salir" />
            </button>
          </div>
        </div>
      </header>

      <main className="contenido">
        <div className="cabecera">
          <div>
            <span className="cabecera-eyebrow"><Icono nombre={info.icono} tam={14} /> {info.seccion}</span>
            <h1>{info.titulo}</h1>
            <p>{info.texto}</p>
          </div>
        </div>

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
        <span>SIGR v1.0.0 · Los datos se guardan en este navegador</span>
        {usuario.rol === "admin" && (
          <button className="btn btn-fantasma btn-sm" onClick={restablecer}>Restablecer datos de demostración</button>
        )}
      </footer>
    </div>
  );
}
