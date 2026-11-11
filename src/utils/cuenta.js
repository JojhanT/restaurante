import { IMPUESTO_CONSUMO, PROPINA } from "../data/mock.js";

export const formatoPesos = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export function calcularCuenta(items, menu, conPropina = true, porcentajeDescuento = 0) {
  const subtotal = items.reduce((acc, it) => {
    const plato = menu.find((p) => p.id === it.platoId);
    return acc + (plato ? plato.precio * it.cantidad : 0);
  }, 0);
  const descuento = Math.round(subtotal * porcentajeDescuento);
  const base = subtotal - descuento;
  const impuesto = Math.round(base * IMPUESTO_CONSUMO);
  const propina = conPropina ? Math.round(base * PROPINA) : 0;
  return { subtotal, descuento, impuesto, propina, total: base + impuesto + propina };
}
