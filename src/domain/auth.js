// Autenticación simulada: no hay servidor, así que las claves se comparan como hash SHA-256.
export async function hashClave(clave) {
  const bytes = new TextEncoder().encode(clave);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function autenticar(usuarios, usuario, clave) {
  const u = usuarios.find((x) => x.usuario === usuario.trim().toLowerCase());
  if (!u || !u.activo) return null;
  return (await hashClave(clave)) === u.clave ? u : null;
}

export async function registrarCliente(usuarios, { nombre, usuario, clave }) {
  const login = usuario.trim().toLowerCase();
  if (nombre.trim().length < 3) return { error: "El nombre debe tener al menos 3 caracteres" };
  if (!/^[a-z0-9_.]{4,20}$/.test(login)) return { error: "Usuario: 4 a 20 letras minúsculas, números, punto o guion bajo" };
  if (clave.length < 8 || !/[a-z]/i.test(clave) || !/\d/.test(clave)) {
    return { error: "La contraseña debe tener 8 caracteres o más, con letras y números" };
  }
  if (usuarios.some((u) => u.usuario === login)) return { error: "Ese usuario ya existe" };
  const id = Math.max(0, ...usuarios.map((u) => u.id)) + 1;
  return { usuario: { id, nombre: nombre.trim(), usuario: login, rol: "cliente", clave: await hashClave(clave), activo: true } };
}

// Qué puede abrir cada rol.
export const VISTAS_POR_ROL = {
  admin: ["pedidos", "carta", "reservas", "caja", "usuarios"],
  mesero: ["pedidos", "carta", "reservas"],
  cliente: ["carta", "reservas"],
};

export const NOMBRE_ROL = { admin: "Administrador", mesero: "Mesero", cliente: "Cliente" };

export const puedeVer =(rol, vista) => (VISTAS_POR_ROL[rol] ?? []).includes(vista);
