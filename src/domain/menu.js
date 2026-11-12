export function validarPlato({ nombre, precio, categoriaId }, menu, idActual = null) {
  if (!nombre.trim()) return "El nombre es obligatorio";
  if (!(Number(precio) > 0)) return "El precio debe ser mayor a 0";
  if (!categoriaId) return "Elige una categoría";
  const repetido = menu.some((p) => p.id !== idActual && p.nombre.toLowerCase() === nombre.trim().toLowerCase());
  return repetido ? "Ya existe un plato con ese nombre" : "";
}

export const nombreCategoria = (categorias, id) => categorias.find((c) => c.id === id)?.nombre ?? "Sin categoría";

// Una categoría con platos no se puede borrar: se perdería el vínculo.
export const categoriaEnUso = (menu, id) => menu.some((p) => p.categoriaId === id);
