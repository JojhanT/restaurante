// Datos simulados (mock). No hay backend: todo vive en memoria.
export const CATEGORIAS = ["Entradas", "Platos fuertes", "Bebidas", "Postres"];

export const MENU_INICIAL = [
  { id: 1, nombre: "Empanadas (3 uds)", categoria: "Entradas", precio: 9000, emoji: "🥟" },
  { id: 2, nombre: "Ensalada de la casa", categoria: "Entradas", precio: 12000, emoji: "🥗" },
  { id: 3, nombre: "Bandeja paisa", categoria: "Platos fuertes", precio: 28000, emoji: "🍛" },
  { id: 4, nombre: "Sancocho de gallina", categoria: "Platos fuertes", precio: 25000, emoji: "🍲" },
  { id: 5, nombre: "Pechuga a la plancha", categoria: "Platos fuertes", precio: 24000, emoji: "🍗" },
  { id: 6, nombre: "Limonada natural", categoria: "Bebidas", precio: 6000, emoji: "🍋" },
  { id: 7, nombre: "Jugo de mora", categoria: "Bebidas", precio: 7000, emoji: "🥤" },
  { id: 8, nombre: "Tres leches", categoria: "Postres", precio: 10000, emoji: "🍰" },
];

export const MESAS_INICIAL = [
  { id: 1, capacidad: 2, estado: "libre", items: [] },
  { id: 2, capacidad: 4, estado: "ocupada", items: [{ platoId: 3, cantidad: 2 }, { platoId: 6, cantidad: 2 }] },
  { id: 3, capacidad: 4, estado: "libre", items: [] },
  { id: 4, capacidad: 6, estado: "ocupada", items: [{ platoId: 4, cantidad: 1 }] },
  { id: 5, capacidad: 2, estado: "libre", items: [] },
  { id: 6, capacidad: 8, estado: "libre", items: [] },
];

export const IMPUESTO_CONSUMO = 0.08;
export const PROPINA = 0.1;

// Códigos promocionales simulados: código -> porcentaje de descuento
export const DESCUENTOS = { HOLA: 0.1, ADIOS: 0.15 };
