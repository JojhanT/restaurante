import { IMPUESTO_CONSUMO, PROPINA } from "../data/seed.js";

// items: [{ precio, cantidad }]. Devuelve los importes de la cuenta en pesos enteros.
export function calcularCuenta(items, { conPropina = true, porcentajeDescuento = 0 } = {}) {
  const subtotal = items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const descuento = Math.round(subtotal * porcentajeDescuento);
  const base = subtotal - descuento;
  const impuesto = Math.round(base * IMPUESTO_CONSUMO);
  const propina = conPropina ? Math.round(base * PROPINA) : 0;
  return { subtotal, descuento, impuesto, propina, total: base + impuesto + propina };
}

// Códigos promocionales: código -> porcentaje de descuento.
export const DESCUENTOS = { HOLA: 0.1, ADIOS: 0.15 };
