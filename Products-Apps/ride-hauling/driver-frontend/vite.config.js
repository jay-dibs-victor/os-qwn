import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './frontend/src',
  // envDir must point to project root (not frontend/src) so .env is found
  envDir: path.resolve(__dirname, '.'),
  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src'),
    },
  },
  server: {
    port: 4004,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:12000',
        changeOrigin: true,
      },
    },
  },
});
