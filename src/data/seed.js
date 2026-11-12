// Datos iniciales del SIGR. Se cargan la primera vez que se abre la aplicación.
// Las claves de demostración (Admin123, Mesero123, Cliente123) se guardan como hash SHA-256.
export const IMPUESTO_CONSUMO = 0.08;
export const PROPINA = 0.1;

export const USUARIOS_INICIAL = [
  { id: 1, nombre: "Administrador", usuario: "admin", rol: "admin", clave: "3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2", activo: true },
  { id: 2, nombre: "Mesero de turno", usuario: "mesero", rol: "mesero", clave: "55dcec5b6de9023e541d5e308fc8ba2d3c7ff50d23f2e9fd6e99a92ee7dd272c", activo: true },
  { id: 3, nombre: "Cliente de prueba", usuario: "cliente", rol: "cliente", clave: "34e422278ea745b5d87ba6592f0ea3fe32a2eb7593f5960ac72d7094fb121f3d", activo: true },
];

export const CATEGORIAS_INICIAL = [
  { id: 1, nombre: "Entradas" },
  { id: 2, nombre: "Platos fuertes" },
  { id: 3, nombre: "Bebidas" },
  { id: 4, nombre: "Postres" },
];

export const MENU_INICIAL = [
  { id: 1, nombre: "Empanadas (3 uds)", categoriaId: 1, precio: 9000, emoji: "🥟", activo: true },
  { id: 2, nombre: "Ensalada de la casa", categoriaId: 1, precio: 12000, emoji: "🥗", activo: true },
  { id: 3, nombre: "Bandeja paisa", categoriaId: 2, precio: 28000, emoji: "🍛", activo: true },
  { id: 4, nombre: "Sancocho de gallina", categoriaId: 2, precio: 25000, emoji: "🍲", activo: true },
  { id: 5, nombre: "Pechuga a la plancha", categoriaId: 2, precio: 24000, emoji: "🍗", activo: true },
  { id: 6, nombre: "Limonada natural", categoriaId: 3, precio: 6000, emoji: "🍋", activo: true },
  { id: 7, nombre: "Jugo de mora", categoriaId: 3, precio: 7000, emoji: "🥤", activo: true },
  { id: 8, nombre: "Tres leches", categoriaId: 4, precio: 10000, emoji: "🍰", activo: true },
];

export const MESAS_INICIAL = [
  { id: 1, capacidad: 2 },
  { id: 2, capacidad: 4 },
  { id: 3, capacidad: 4 },
  { id: 4, capacidad: 6 },
  { id: 5, capacidad: 2 },
  { id: 6, capacidad: 8 },
];
