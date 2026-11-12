import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // En GitHub Pages el sitio vive en /<repositorio>/; el pipeline lo indica con BASE_PATH.
  base: process.env.BASE_PATH || "/",
  test: {
    coverage: {
      provider: "v8",
      include: ["src/domain/**/*.js"],
      exclude: ["src/domain/**/*.test.js"],
      reporter: ["text", "html", "json-summary"],
      // Las reglas de negocio son lo crítico: si la cobertura baja de aquí, el pipeline falla.
      thresholds: { lines: 85, functions: 85, branches: 75, statements: 85 },
    },
  },
});
