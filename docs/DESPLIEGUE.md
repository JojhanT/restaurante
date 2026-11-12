# Manual de despliegue

El SIGR es una aplicación estática: el resultado de `npm run build` es una carpeta `dist/` que se publica en cualquier servidor web.

## Despliegue automático (staging)

Cada push a `main` pasa por el pipeline ([.github/workflows/pipeline.yml](../.github/workflows/pipeline.yml)) y, si todas las etapas aprueban, se publica en GitHub Pages: `https://jojhant.github.io/restaurante/`.

Configuración única del repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Para volver a una versión anterior, revierte el commit en `main` (`git revert <hash>`) y haz push: el pipeline vuelve a construir y publicar.

## Despliegue manual

### 1. Requisitos

- Node.js 20.19 o superior y npm
- Git

### 2. Obtener y construir

```bash
git clone https://github.com/JojhanT/restaurante.git
cd restaurante
git checkout v1.0.0-linea-base   # la línea base; omitir para usar main
npm ci
npm test
npm run build
```

### 3. Publicar `dist/`

**Servidor propio (Nginx):**

```nginx
server {
  listen 80;
  server_name restaurante.ejemplo.com;
  root /var/www/sigr;
  index index.html;
  location / { try_files $uri /index.html; }
}
```

Copia el contenido de `dist/` a `/var/www/sigr` y recarga Nginx.

**Netlify / Vercel:** apunta el servicio al repositorio, comando de build `npm run build` y carpeta de salida `dist`.

Si el sitio no se sirve desde la raíz del dominio, indica la ruta al construir: `BASE_PATH=/subcarpeta/ npm run build`.

### 4. Verificación

1. Abre la URL y entra con `admin` / `Admin123`.
2. Abre una mesa, agrega un plato y envíalo a cocina.
3. En otra pestaña, entra como `mesero` y comprueba que el estado se actualiza.
4. Cobra el pedido y revisa la factura en **Caja y reportes**.

### 5. Notas

- Los datos se guardan en el navegador de cada equipo; para compartir datos entre equipos se requiere un backend (fuera del alcance de la línea base).
- Cambia las claves de demostración antes de usar el sistema con datos reales.
- Para volver a los datos de demostración: **Restablecer datos de demo** (solo administrador).
