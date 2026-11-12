import { describe, expect, it } from "vitest";
import { MENU_INICIAL, MESAS_INICIAL, USUARIOS_INICIAL } from "../data/seed.js";
import { autenticar, hashClave, puedeVer, registrarCliente } from "./auth.js";
import { aCSV, cerrarCaja, nuevaFactura, platosMasVendidos, reportePorDia, resumen } from "./caja.js";
import { calcularCuenta } from "./cuenta.js";
import { categoriaEnUso, validarPlato } from "./menu.js";
import { agregarItem, avanzar, cambiarCantidad, nuevoPedido, pedidoDeMesa } from "./pedidos.js";
import { crearReserva, mesasDisponibles } from "./reservas.js";

describe("autenticación y roles", () => {
  it("acepta credenciales válidas y rechaza las incorrectas", async () => {
    expect((await autenticar(USUARIOS_INICIAL, "admin", "Admin123"))?.rol).toBe("admin");
    expect(await autenticar(USUARIOS_INICIAL, "admin", "otra")).toBeNull();
    expect(await autenticar(USUARIOS_INICIAL, "nadie", "Admin123")).toBeNull();
  });

  it("registra clientes con clave cifrada y rechaza claves débiles o usuarios repetidos", async () => {
    const ok = await registrarCliente(USUARIOS_INICIAL, { nombre: "Ana Pérez", usuario: "anap", clave: "Segura2024" });
    expect(ok.usuario.rol).toBe("cliente");
    expect(ok.usuario.clave).toBe(await hashClave("Segura2024"));
    expect((await registrarCliente(USUARIOS_INICIAL, { nombre: "Ana", usuario: "anap", clave: "corta" })).error).toBeTruthy();
    expect((await registrarCliente(USUARIOS_INICIAL, { nombre: "Otro", usuario: "admin", clave: "Segura2024" })).error).toMatch(/existe/);
  });

  it("limita las vistas por rol", () => {
    expect(puedeVer("cliente", "caja")).toBe(false);
    expect(puedeVer("mesero", "caja")).toBe(false);
    expect(puedeVer("admin", "caja")).toBe(true);
    expect(puedeVer("cliente", "reservas")).toBe(true);
  });
});

describe("menú", () => {
  it("valida platos y evita nombres repetidos", () => {
    expect(validarPlato({ nombre: "", precio: 5, categoriaId: 1 }, MENU_INICIAL)).toMatch(/nombre/);
    expect(validarPlato({ nombre: "Sopa", precio: 0, categoriaId: 1 }, MENU_INICIAL)).toMatch(/precio/);
    expect(validarPlato({ nombre: "bandeja paisa", precio: 5, categoriaId: 2 }, MENU_INICIAL)).toMatch(/Ya existe/);
    expect(validarPlato({ nombre: "Sopa", precio: 8000, categoriaId: 1 }, MENU_INICIAL)).toBe("");
  });

  it("detecta categorías en uso", () => {
    expect(categoriaEnUso(MENU_INICIAL, 1)).toBe(true);
    expect(categoriaEnUso(MENU_INICIAL, 99)).toBe(false);
  });
});

describe("pedidos", () => {
  const ahora = new Date("2026-05-10T12:00:00");

  it("agrega platos con precio congelado y avanza por los estados", () => {
    let p = nuevoPedido([], 2, 2, ahora);
    expect(avanzar(p).error).toMatch(/al menos un plato/);
    p = agregarItem(p, MENU_INICIAL[2]);
    p = agregarItem(p, MENU_INICIAL[2]);
    expect(p.items).toEqual([expect.objectContaining({ platoId: 3, cantidad: 2, precio: 28000 })]);
    const estados = [];
    while (!avanzar(p).error) {
      p = avanzar(p).pedido;
      estados.push(p.estado);
    }
    expect(estados).toEqual(["en_preparacion", "listo", "servido"]);
  });

  it("quita el plato al bajar la cantidad a cero", () => {
    let p = agregarItem(nuevoPedido([], 1, 2, ahora), MENU_INICIAL[0]);
    p = cambiarCantidad(p, 1, -1);
    expect(p.items).toHaveLength(0);
  });

  it("encuentra el pedido abierto de una mesa", () => {
    const abierto = nuevoPedido([], 3, 2, ahora);
    const cobrado = { ...nuevoPedido([abierto], 3, 2, ahora), estado: "cobrado" };
    expect(pedidoDeMesa([cobrado, abierto], 3)).toBe(abierto);
    expect(pedidoDeMesa([cobrado], 3)).toBeUndefined();
  });
});

describe("cuenta", () => {
  it("calcula impoconsumo 8 %, propina 10 % y descuento", () => {
    const items = [{ precio: 10000, cantidad: 2 }];
    expect(calcularCuenta(items)).toEqual({ subtotal: 20000, descuento: 0, impuesto: 1600, propina: 2000, total: 23600 });
    expect(calcularCuenta(items, { conPropina: false, porcentajeDescuento: 0.1 }).total).toBe(18000 + 1440);
  });
});

describe("reservas", () => {
  const ahora = new Date("2026-05-10T09:00:00");
  const base = { nombre: "Ana", clienteId: 3, fecha: "2026-05-12", hora: "19:00", personas: 2 };

  it("asigna la mesa más pequeña que sirva", () => {
    const { reserva } = crearReserva(base, { mesas: MESAS_INICIAL, reservas: [], ahora });
    expect(reserva.mesaId).toBe(1);
    expect(crearReserva({ ...base, personas: 5 }, { mesas: MESAS_INICIAL, reservas: [], ahora }).reserva.mesaId).toBe(4);
  });

  it("no permite reservar en el pasado, fuera de horario ni sobre capacidad", () => {
    const ctx = { mesas: MESAS_INICIAL, reservas: [], ahora };
    expect(crearReserva({ ...base, fecha: "2026-05-09" }, ctx).error).toMatch(/futuras/);
    expect(crearReserva({ ...base, hora: "08:00" }, ctx).error).toMatch(/entre las/);
    expect(crearReserva({ ...base, personas: 20 }, ctx).error).toMatch(/más grande/);
  });

  it("bloquea mesas ocupadas en horarios que se solapan y libera las canceladas", () => {
    const ctx = { mesas: [{ id: 1, capacidad: 2 }], ahora };
    const primera = crearReserva(base, { ...ctx, reservas: [] }).reserva;
    expect(crearReserva({ ...base, hora: "20:00" }, { ...ctx, reservas: [primera] }).error).toMatch(/No hay mesas/);
    expect(mesasDisponibles({ ...base, hora: "21:00" }, ctx.mesas, [primera])).toHaveLength(1);
    expect(crearReserva({ ...base, hora: "20:00" }, { ...ctx, reservas: [{ ...primera, estado: "cancelada" }] }).reserva).toBeDefined();
  });
});

describe("caja y reportes", () => {
  const pedido = (id, platos) => ({ id, mesaId: id, items: platos });
  const factura = (facturas, id, medioPago, fecha = "2026-05-10") =>
    nuevaFactura(facturas, {
      pedido: pedido(id, [{ nombre: "Bandeja paisa", precio: 10000, cantidad: 1 }]),
      cuenta: calcularCuenta([{ precio: 10000, cantidad: 1 }]),
      medioPago, cajero: "admin", fecha, hora: "13:00",
    });

  it("resume ventas por medio de pago y arma el reporte diario", () => {
    const f1 = factura([], 1, "efectivo");
    const f2 = factura([f1], 2, "tarjeta", "2026-05-11");
    const r = resumen([f1, f2]);
    expect(r.cantidad).toBe(2);
    expect(r.total).toBe(2 * 11800);
    expect(r.porMedio).toEqual({ efectivo: 11800, tarjeta: 11800, transferencia: 0 });
    expect(reportePorDia([f1, f2]).map((d) => d.fecha)).toEqual(["2026-05-11", "2026-05-10"]);
    expect(platosMasVendidos([f1, f2])[0]).toEqual({ nombre: "Bandeja paisa", cantidad: 2 });
  });

  it("cierra la caja una sola vez y calcula la diferencia de efectivo", () => {
    const f1 = factura([], 1, "efectivo");
    const f2 = factura([f1], 2, "tarjeta");
    const res = cerrarCaja([f1, f2], [], { efectivoContado: 11000, usuario: "admin", fecha: "2026-05-10", hora: "22:00" });
    expect(res.cierre).toMatchObject({ facturas: 2, efectivoEsperado: 11800, diferencia: -800 });
    expect(res.facturas.every((f) => f.cierreId === 1)).toBe(true);
    expect(cerrarCaja(res.facturas, [res.cierre], { efectivoContado: 0, usuario: "admin", fecha: "x", hora: "y" }).error).toMatch(/pendientes/);
  });

  it("exporta CSV con encabezado y una fila por factura", () => {
    const csv = aCSV([factura([], 1, "efectivo")]);
    expect(csv.split("\n")).toHaveLength(2);
    expect(csv).toContain("1x Bandeja paisa");
  });
});
