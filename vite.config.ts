import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Transpile for older phones and in-app browsers (WhatsApp, Instagram,
    // QR scanner apps) whose engines can't parse the newest syntax, which
    // previously left the verification page blank.
    target: ['es2019', 'chrome79', 'safari15', 'firefox78', 'edge88'],
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        verify: fileURLToPath(new URL('./verify.html', import.meta.url)),
      },
    },
  },
});
