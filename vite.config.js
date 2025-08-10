import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: [
      "front-student-system-production.up.railway.app",
      "localhost",
      "127.0.0.1",
    ],
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
