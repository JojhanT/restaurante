// Notificaciones simples: cualquier componente llama mostrarToast("mensaje").
export const mostrarToast = (mensaje, tipo = "ok") =>
  window.dispatchEvent(new CustomEvent("toast", { detail: { mensaje, tipo } }));
