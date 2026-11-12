export const formatoPesos = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const dos = (n) => String(n).padStart(2, "0");
export const fechaISO = (d = new Date()) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
export const horaHM = (d = new Date()) => `${dos(d.getHours())}:${dos(d.getMinutes())}`;
