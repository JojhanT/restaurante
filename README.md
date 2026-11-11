# Restaurante El Sabor - Front-end (React)

Interfaz grafica en React + Vite para gestionar menú, mesas, pedidos y facturación, los datos Datos viven en memoria.

## Requisitos

- Node.js 18 o superior

## Ejecución

```
npm install
npm run dev
```

Abrir http://localhost:5173

## Estructura

```
src/
  App.jsx                  # navegación y estado global
  data/mock.js             # datos simulados
  utils/cuenta.js          # cálculo de cuenta (impoconsumo 8 %, propina 10 %)
  components/
    Menu.jsx               # listado, filtro, alta y baja de platos
    Mesas.jsx              # tablero de mesas
    Pedido.jsx             # pedido, cobro y factura
  styles.css
```

## Convención de commits

`feat:`, `fix:`, `docs:`, `style:`, `chore:`
