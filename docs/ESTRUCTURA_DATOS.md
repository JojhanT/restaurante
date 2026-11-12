# Estructura de datos

El SIGR guarda cada colección como un arreglo JSON en `localStorage`, con la clave `sigr:<colección>`. Cambiar una colección en una pestaña actualiza las demás mediante el evento `storage`.

| Colección | Clave | Contenido |
|---|---|---|
| Usuarios | `sigr:usuarios` | Cuentas del sistema |
| Categorías | `sigr:categorias` | Categorías de la carta |
| Carta | `sigr:menu` | Platos |
| Mesas | `sigr:mesas` | Mesas físicas y su capacidad |
| Pedidos | `sigr:pedidos` | Pedidos por mesa |
| Reservas | `sigr:reservas` | Reservas de clientes |
| Facturas | `sigr:facturas` | Ventas cobradas |
| Cierres | `sigr:cierres` | Cierres de caja |
| Sesión | `sigr:sesion` | Id del usuario con sesión iniciada |

## Entidades

```text
usuarios   { id, nombre, usuario, rol: cliente|mesero|admin, clave (SHA-256), activo }
categorias { id, nombre }
menu       { id, nombre, categoriaId -> categorias.id, precio, emoji, activo }
mesas      { id, capacidad }
pedidos    { id, mesaId -> mesas.id, meseroId -> usuarios.id,
             estado: pendiente|en_preparacion|listo|servido|cobrado|cancelado,
             items: [{ platoId, nombre, emoji, precio, cantidad }], creado }
reservas   { id, clienteId -> usuarios.id, nombre, fecha (AAAA-MM-DD), hora (HH:MM),
             personas, mesaId -> mesas.id, estado: pendiente|confirmada|cancelada, creada }
facturas   { id, pedidoId -> pedidos.id, mesaId, fecha, hora, items[], cajero,
             medioPago: efectivo|tarjeta|transferencia, cierreId -> cierres.id | null,
             cuenta: { subtotal, descuento, impuesto, propina, total } }
cierres    { id, fecha, hora, usuario, facturas, total, propinas,
             efectivoEsperado, efectivoContado, diferencia }
```

## Reglas relevantes

- Las líneas de `pedidos.items` y `facturas.items` guardan nombre y precio **del momento**; editar la carta no cambia el historial.
- Una mesa está ocupada mientras tenga un pedido que no esté `cobrado` ni `cancelado`.
- Una factura con `cierreId = null` está pendiente de cierre de caja.
- Una reserva activa (no cancelada) bloquea su mesa 2 horas; dos reservas de la misma mesa y fecha no pueden estar a menos de 2 horas.
- Impoconsumo 8 % y propina sugerida 10 % sobre el subtotal menos el descuento.
