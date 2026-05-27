import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/biseni_secondary_school/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600, // Raises the alert ceiling to 600kB to avoid false alarms
    rollupOptions: {
      output: {
        // Splits heavy node_modules dependencies into separate bundles
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons'; // Puts icons into their own file
            }
            return 'vendor-core'; // Puts axios, react, and other libraries here
          }
        },
      },
    },
  },
});