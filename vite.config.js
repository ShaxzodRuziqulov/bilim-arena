import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' — Electron ichida file:// orqali ochilganda yo'llar to'g'ri ishlashi uchun.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
});
