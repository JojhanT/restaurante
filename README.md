# SIGR · Sistema Integral de Gestión de Restaurante

Aplicación web (React + Vite) para gestionar **pedidos, reservas, carta, caja y reportes** de un restaurante. Este repositorio contiene la **línea base v1.0.0** del código fuente (ver [CHANGELOG.md](CHANGELOG.md)).

> Los datos viven en el navegador (`localStorage`) y se sincronizan entre pestañas; no hay servidor. Ver [docs/ESTRUCTURA_DATOS.md](docs/ESTRUCTURA_DATOS.md).

## Módulos de la línea base

| Módulo | Quién lo usa | Qué hace |
|---|---|---|
| Autenticación | Todos | Ingreso, registro de clientes, roles (`cliente`, `mesero`, `admin`) y claves con hash SHA-256 |
| Carta digital | Todos (CRUD solo admin) | Platos y categorías: crear, editar, ocultar y eliminar |
| Pedidos en tiempo real | Mesero, admin | Abrir pedido por mesa, enviarlo a cocina y seguir su estado hasta cobrarlo |
| Reservas | Cliente, mesero, admin | Reservas por fecha y hora con asignación automática de mesa y control de cruces |
| Caja y reportes | Admin | Facturación, cierre de caja, reporte diario, platos más vendidos y exportación CSV |

## Requisitos

- Node.js 18 o superior

## Instalación y ejecución

```bash
git clone https://github.com/JojhanT/restaurante.git
cd restaurante
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

```bash
npm test           # pruebas automáticas (Vitest)
npm run build      # genera dist/ para producción
npm run preview    # sirve dist/ localmente
```

## Cuentas de demostración

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin123` |
| Mesero | `mesero` | `Mesero123` |
| Cliente | `cliente` | `Cliente123` |

Los clientes nuevos se registran desde la pantalla de ingreso. El administrador puede cambiar roles y desactivar cuentas en **Usuarios**.

## Estructura

```
src/
  App.jsx             # sesión, navegación por rol y estado global
  data/seed.js        # usuarios, carta, categorías y mesas iniciales
  domain/             # reglas de negocio (funciones puras, con pruebas)
    auth.js  menu.js  pedidos.js  reservas.js  caja.js  cuenta.js  format.js
  hooks/useLocalStorage.js   # persistencia + sincronización entre pestañas
  components/         # Login, Carta, Pedidos, Reservas, Caja, Usuarios, Toasts
docs/                 # estructura de datos y manual de despliegue
.github/workflows/ci.yml     # pruebas y build en cada push / pull request
```

## Flujo de trabajo y versionado

- Rama estable: `main`. El trabajo nuevo se hace en ramas `feature/...` y entra por pull request.
- Línea base: etiqueta `v1.0.0-linea-base`.
- Convención de commits: `feat:`, `fix:`, `docs:`, `style:`, `chore:`, `test:`.
- Seguimiento de mejoras y errores: GitHub Issues.

## Documentación

- [CHANGELOG.md](CHANGELOG.md): historial de cambios hasta la línea base.
- [docs/ESTRUCTURA_DATOS.md](docs/ESTRUCTURA_DATOS.md): modelo de datos.
- [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md): manual de despliegue.
- [LICENSE](LICENSE): licencia MIT.
