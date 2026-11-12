# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico.

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
