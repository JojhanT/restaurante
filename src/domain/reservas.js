export const APERTURA = "12:00";
export const ULTIMA_RESERVA = "21:00";
export const DURACION_MIN = 120;

export const aMinutos = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

const activa = (r) => r.estado !== "cancelada";
const solapan = (a, b) => a.fecha === b.fecha && Math.abs(aMinutos(a.hora) - aMinutos(b.hora)) < DURACION_MIN;

export function mesasDisponibles({ fecha, hora, personas }, mesas, reservas) {
  return mesas
    .filter((m) => m.capacidad >= personas)
    .filter((m) => !reservas.some((r) => r.mesaId === m.id && activa(r) && solapan(r, { fecha, hora })))
    .sort((a, b) => a.capacidad - b.capacidad);
}

// Devuelve { error } o { reserva } con la mesa más pequeña que sirva para el grupo.
export function crearReserva(datos, { mesas, reservas, ahora = new Date() }) {
  const { fecha, hora, personas, clienteId, nombre } = datos;
  if (!nombre?.trim()) return { error: "Indica el nombre de quien reserva" };
  if (!fecha || !hora) return { error: "Elige fecha y hora" };
  if (!(personas >= 1)) return { error: "Indica cuántas personas asistirán" };
  const inicio = new Date(`${fecha}T${hora}:00`);
  if (Number.isNaN(inicio.getTime()) || inicio <= ahora) return { error: "La reserva debe ser en una fecha y hora futuras" };
  if (aMinutos(hora) < aMinutos(APERTURA) || aMinutos(hora) > aMinutos(ULTIMA_RESERVA)) {
    return { error: `Se reserva entre las ${APERTURA} y las ${ULTIMA_RESERVA}` };
  }
  const maxima = Math.max(...mesas.map((m) => m.capacidad));
  if (personas > maxima) return { error: `Nuestra mesa más grande es para ${maxima} personas` };
  const [mesa] = mesasDisponibles({ fecha, hora, personas }, mesas, reservas);
  if (!mesa) return { error: "No hay mesas disponibles en ese horario; prueba otra hora" };
  const id = Math.max(0, ...reservas.map((r) => r.id)) + 1;
  return {
    reserva: { id, clienteId, nombre: nombre.trim(), fecha, hora, personas, mesaId: mesa.id, estado: "pendiente", creada: ahora.toISOString() },
  };
}
