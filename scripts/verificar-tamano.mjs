// Presupuesto de rendimiento: falla si el paquete que descarga el navegador crece más de lo permitido.
import { readdirSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const LIMITES_KB = { js: 100, css: 15 }; // tamaño comprimido (gzip) por tipo de archivo
const carpeta = "dist/assets";

const totales = { js: 0, css: 0 };
for (const archivo of readdirSync(carpeta)) {
  const tipo = archivo.split(".").pop();
  if (!(tipo in totales)) continue;
  totales[tipo] += gzipSync(readFileSync(join(carpeta, archivo))).length / 1024;
}

let falla = false;
const filas = Object.entries(totales).map(([tipo, kb]) => {
  const ok = kb <= LIMITES_KB[tipo];
  if (!ok) falla = true;
  return `| ${tipo.toUpperCase()} | ${kb.toFixed(1)} KB | ${LIMITES_KB[tipo]} KB | ${ok ? "✅ dentro" : "❌ excedido"} |`;
});
const tabla = ["| Recurso | Tamaño gzip | Límite | Estado |", "|---|---|---|---|", ...filas].join("\n");

console.log(tabla);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Presupuesto de rendimiento\n\n${tabla}\n`);
if (falla) {
  console.error("\nEl paquete supera el presupuesto de rendimiento.");
  process.exit(1);
}
