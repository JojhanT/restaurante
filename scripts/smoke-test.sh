#!/usr/bin/env bash
# Prueba de humo después del despliegue: disponibilidad, contenido y tiempo de respuesta del sitio.
# Uso: scripts/smoke-test.sh <url> [segundos_maximos]
set -euo pipefail

URL="${1:?Uso: smoke-test.sh <url> [segundos_maximos]}"
LIMITE="${2:-2}"
PAGINA="$(mktemp)"

# GitHub Pages puede tardar unos segundos en publicar: se reintenta antes de declarar la caída.
for intento in 1 2 3 4 5 6; do
  read -r codigo tiempo < <(curl -sS -o "$PAGINA" -w "%{http_code} %{time_total}\n" "$URL" || echo "000 0")
  [ "$codigo" = "200" ] && break
  echo "Intento $intento: el sitio respondió $codigo; nuevo intento en 10 s"
  sleep 10
done

[ "$codigo" = "200" ] || { echo "❌ El sitio no está disponible (HTTP $codigo)"; exit 1; }
grep -q 'id="root"' "$PAGINA" || { echo "❌ La página no contiene la aplicación"; exit 1; }

SCRIPT="$(grep -o 'assets/index-[^"]*\.js' "$PAGINA" | head -1)"
codigo_js="$(curl -sS -o /dev/null -w "%{http_code}" "${URL%/}/$SCRIPT")"
[ "$codigo_js" = "200" ] || { echo "❌ El paquete JavaScript no carga (HTTP $codigo_js)"; exit 1; }

awk -v t="$tiempo" -v l="$LIMITE" 'BEGIN { exit !(t <= l) }' || { echo "❌ Respuesta lenta: ${tiempo}s (límite ${LIMITE}s)"; exit 1; }

RESUMEN="| Verificación | Resultado |
|---|---|
| Disponibilidad | ✅ HTTP $codigo |
| Contenido | ✅ aplicación presente |
| Paquete JavaScript | ✅ HTTP $codigo_js |
| Tiempo de respuesta | ✅ ${tiempo}s (límite ${LIMITE}s) |"
echo "$RESUMEN"
[ -n "${GITHUB_STEP_SUMMARY:-}" ] && printf '### Verificación post-despliegue\n\n%s\n\nSitio: %s\n' "$RESUMEN" "$URL" >> "$GITHUB_STEP_SUMMARY"
echo "✅ Despliegue verificado: $URL"
