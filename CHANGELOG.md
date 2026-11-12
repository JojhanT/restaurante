# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico.

## [1.1.0] - Sin publicar

### Añadido
- **Pipeline CI/CD** (CR-002) en seis etapas: calidad (ESLint), pruebas con umbral de cobertura y reporte JUnit, seguridad (`npm audit` y CodeQL), construcción con presupuesto de tamaño, despliegue a staging en GitHub Pages y prueba de humo posterior.
- Pruebas de formato (pesos, fecha y hora) y de nombres de categoría.

### Cambiado
- **Rediseño de la interfaz** (CR-001): paleta con modo oscuro, íconos, formularios con etiquetas visibles y navegación adaptada al celular.
- Vite 5 → 8, Vitest 2 → 5 y plugin de React 4 → 6. Requiere Node.js 20.19 o superior.

### Seguridad
- Se corrigieron 6 vulnerabilidades de las herramientas de desarrollo (2 críticas, 1 alta y 3 moderadas) que reportó `npm audit`.

## [1.0.0] - Línea base

Primer hito estable del SIGR. Reúne el trabajo previo del prototipo y los módulos de la línea base.

### Añadido
- **Autenticación**: ingreso, registro de clientes, roles `cliente`/`mesero`/`admin`, claves con hash SHA-256 y vistas restringidas por rol.
- **Carta digital**: CRUD de platos y categorías; ocultar platos sin borrarlos; validación de nombres repetidos y de categorías en uso.
- **Pedidos**: pedido por mesa con estados `pendiente → en cocina → listo → servido → cobrado`, sincronizado entre pestañas.
- **Reservas** por fecha y hora, con asignación de la mesa más pequeña disponible y control de cruces (2 h por reserva).
- **Caja**: facturación con medio de pago, cierre de caja con diferencia de efectivo, reporte diario, platos más vendidos.
- **Usuarios**: el administrador cambia roles y activa o desactiva cuentas.
- Pruebas automáticas (Vitest) de las reglas de negocio e integración continua con GitHub Actions.
- Documentación: README, estructura de datos y manual de despliegue.

### Cambiado
- Las líneas de pedido guardan nombre y precio del momento, de modo que editar la carta no altera facturas anteriores.
- La reorganización del código separa las reglas de negocio (`src/domain`) de la interfaz (`src/components`).

### Heredado del prototipo
- `feat:` primeros cambios visuales; historial de ventas y tipografía Roboto.
- `feat:` persistencia en localStorage.
- `feat:` descuentos y factura.
- `feat:` exportación del historial en CSV.
- `style:` mejora del diseño.
- `feat:` mejora de los códigos promocionales `HOLA` y `ADIOS`.
