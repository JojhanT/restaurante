import { useEffect, useState } from "react";
import Menu from "./components/Menu.jsx";
import Mesas from "./components/Mesas.jsx";
import Ventas from "./components/Ventas.jsx";
import useLocalStorage from "./hooks/useLocalStorage.js";
import { MENU_INICIAL, MESAS_INICIAL } from "./data/mock.js";

const TITULOS = {
  mesas: ["Salón principal", "Gestiona mesas, pedidos y cobros en tiempo real."],
  menu: ["Nuestra carta", "Administra los platos que ofrece el restaurante."],
  ventas: ["Caja del día", "Consulta las facturas emitidas y el total vendido."],
};

export default function App() {
  const [vista, setVista] = useState("mesas");
  const [menu, setMenu] = useLocalStorage("menu", MENU_INICIAL);
  const [mesas, setMesas] = useLocalStorage("mesas", MESAS_INICIAL);
  const [ventas, setVentas] = useLocalStorage("ventas", []);

  function restablecer() {
    if (!window.confirm("¿Restablecer todos los datos de demostración?")) return;
    setMenu(MENU_INICIAL);
    setMesas(MESAS_INICIAL);
    setVentas([]);
  }
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem("tema") || "claro";
    } catch {
      return "claro";
    }
  });

  function registrarVenta(venta) {
    const hora = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    setVentas((prev) => [{ ...venta, id: prev.length + 1, hora }, ...prev]);
  }

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem("tema", tema);
    } catch {
      /* sin almacenamiento */
    }
  }, [tema]);

  return (
    <div className="app">
      <header className="hero">
        <div className="topbar">
          <div className="marca">
            <div className="logo">🍴</div>
            <div>
              <h1>El Sabor</h1>
              <small>Restaurante</small>
            </div>
          </div>
          <div className="acciones">
            <nav>
              <button className={vista === "mesas" ? "activo" : ""} onClick={() => setVista("mesas")}>
                Mesas y pedidos
              </button>
              <button className={vista === "menu" ? "activo" : ""} onClick={() => setVista("menu")}>
                Menú
              </button>
              <button className={vista === "ventas" ? "activo" : ""} onClick={() => setVista("ventas")}>
                Ventas
              </button>
            </nav>
            <button
              className="tema"
              title="Cambiar tema"
              onClick={() => setTema(tema === "claro" ? "oscuro" : "claro")}
            >
              {tema === "claro" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
        <div className="hero-texto">
          <h2>{TITULOS[vista][0]}</h2>
          <p>{TITULOS[vista][1]}</p>
        </div>
      </header>
      <main>
        {vista === "menu" && <Menu menu={menu} setMenu={setMenu} />}
        {vista === "mesas" && (
          <Mesas menu={menu} mesas={mesas} setMesas={setMesas} registrarVenta={registrarVenta} />
        )}
        {vista === "ventas" && <Ventas ventas={ventas} limpiar={() => setVentas([])} />}
      </main>
      <footer className="pie">
        <span>Datos guardados en este navegador</span>
        <button className="chip" onClick={restablecer}>Restablecer datos de demo</button>
      </footer>
    </div>
  );
}
