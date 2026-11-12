// Ciclo de vida de un pedido: pendiente -> en_preparacion -> listo -> servido -> cobrado.
export const ESTADOS = ["pendiente", "en_preparacion", "listo", "servido"];
export const ETIQUETAS = {
  pendiente: "Pendiente",
  en_preparacion: "En cocina",
  listo: "Listo",
  servido: "Servido",
  cobrado: "Cobrado",
  cancelado: "Cancelado",
};

export const estaAbierto = (p) => p.estado !== "cobrado" && p.estado !== "cancelado";
export const pedidoDeMesa = (pedidos, mesaId) => pedidos.find((p) => p.mesaId === mesaId && estaAbierto(p));

export function nuevoPedido(pedidos, mesaId, meseroId, ahora = new Date()) {
  const id = Math.max(0, ...pedidos.map((p) => p.id)) + 1;
  return { id, mesaId, meseroId, estado: "pendiente", items: [], creado: ahora.toISOString() };
}

// Los items guardan nombre y precio del momento: editar la carta no altera pedidos ni facturas anteriores.
export function agregarItem(pedido, plato) {
  const existe = pedido.items.find((i) => i.platoId === plato.id);
  const items = existe
    ? pedido.items.map((i) => (i.platoId === plato.id ? { ...i, cantidad: i.cantidad + 1 } : i))
    : [...pedido.items, { platoId: plato.id, nombre: plato.nombre, emoji: plato.emoji, precio: plato.precio, cantidad: 1 }];
  return { ...pedido, items };
}

export function cambiarCantidad(pedido, platoId, delta) {
  const items = pedido.items
    .map((i) => (i.platoId === platoId ? { ...i, cantidad: i.cantidad + delta } : i))
    .filter((i) => i.cantidad > 0);
  return { ...pedido, items };
}

export function siguienteEstado(estado) {
  const i = ESTADOS.indexOf(estado);
  return i >= 0 && i < ESTADOS.length - 1 ? ESTADOS[i + 1] : null;
}

// Un pedido vacío no puede ir a cocina; uno ya servido no avanza más (solo se cobra).
export function avanzar(pedido) {
  const sig = siguienteEstado(pedido.estado);
  if (!sig) return { error: "El pedido ya está servido; solo falta cobrarlo" };
  if (pedido.items.length === 0) return { error: "Agrega al menos un plato antes de enviar a cocina" };
  return { pedido: { ...pedido, estado: sig } };
}

export const sePuedeEditar = (pedido) => pedido.estado === "pendiente";
