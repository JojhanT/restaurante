import { IMPUESTO_CONSUMO, PROPINA } from "../data/mock.js";

export const formatoPesos = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export function calcularCuenta(items, menu, conPropina = true) {
  const subtotal = items.reduce((acc, it) => {
    const plato = menu.find((p) => p.id === it.platoId);
    return acc + (plato ? plato.precio * it.cantidad : 0);
  }, 0);
  const impuesto = Math.round(subtotal * IMPUESTO_CONSUMO);
  const propina = conPropina ? Math.round(subtotal * PROPINA) : 0;
  return { subtotal, impuesto, propina, total: subtotal + impuesto + propina };
}
