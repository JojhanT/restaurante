export const MEDIOS_PAGO = ["efectivo", "tarjeta", "transferencia"];

export function nuevaFactura(facturas, { pedido, cuenta, medioPago, cajero, fecha, hora }) {
  const id = Math.max(0, ...facturas.map((f) => f.id)) + 1;
  return { id, pedidoId: pedido.id, mesaId: pedido.mesaId, fecha, hora, items: pedido.items, cuenta, medioPago, cajero, cierreId: null };
}

export function resumen(facturas) {
  const suma = (fn) => facturas.reduce((acc, f) => acc + fn(f), 0);
  const total = suma((f) => f.cuenta.total);
  const porMedio = Object.fromEntries(MEDIOS_PAGO.map((m) => [m, suma((f) => (f.medioPago === m ? f.cuenta.total : 0))]));
  return {
    cantidad: facturas.length,
    total,
    subtotal: suma((f) => f.cuenta.subtotal),
    descuentos: suma((f) => f.cuenta.descuento),
    impuesto: suma((f) => f.cuenta.impuesto),
    propinas: suma((f) => f.cuenta.propina),
    promedio: facturas.length ? Math.round(total / facturas.length) : 0,
    porMedio,
  };
}

export const pendientesDeCierre = (facturas) => facturas.filter((f) => !f.cierreId);

// Cierra la caja con las facturas aún sin cierre; devuelve el cierre y las facturas ya marcadas.
export function cerrarCaja(facturas, cierres, { efectivoContado, usuario, fecha, hora }) {
  const pendientes = pendientesDeCierre(facturas);
  if (pendientes.length === 0) return { error: "No hay ventas pendientes de cierre" };
  if (!(efectivoContado >= 0)) return { error: "Indica el efectivo contado en caja" };
  const id = Math.max(0, ...cierres.map((c) => c.id)) + 1;
  const r = resumen(pendientes);
  const cierre = {
    id, fecha, hora, usuario, facturas: r.cantidad, total: r.total, propinas: r.propinas,
    efectivoEsperado: r.porMedio.efectivo, efectivoContado, diferencia: efectivoContado - r.porMedio.efectivo,
  };
  return { cierre, facturas: facturas.map((f) => (f.cierreId ? f : { ...f, cierreId: id })) };
}

export function reportePorDia(facturas) {
  const dias = [...new Set(facturas.map((f) => f.fecha))].sort().reverse();
  return dias.map((fecha) => ({ fecha, ...resumen(facturas.filter((f) => f.fecha === fecha)) }));
}

export function platosMasVendidos(facturas, limite = 5) {
  const cuenta = new Map();
  facturas.forEach((f) => f.items.forEach((i) => cuenta.set(i.nombre, (cuenta.get(i.nombre) ?? 0) + i.cantidad)));
  return [...cuenta].map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad).slice(0, limite);
}

export function aCSV(facturas) {
  const filas = [["Factura", "Fecha", "Hora", "Mesa", "Platos", "Subtotal", "Descuento", "Impuesto", "Propina", "Total", "Medio de pago"]];
  facturas.forEach((f) =>
    filas.push([
      f.id, f.fecha, f.hora, f.mesaId,
      `"${f.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(", ").replace(/"/g, '""')}"`,
      f.cuenta.subtotal, f.cuenta.descuento, f.cuenta.impuesto, f.cuenta.propina, f.cuenta.total, f.medioPago,
    ])
  );
  return "﻿" + filas.map((f) => f.join(",")).join("\n");
}
