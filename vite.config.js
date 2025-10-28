import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), 
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },

  base: '/',
  build: {
    rollupOptions: {
      external: [], 
    },
    // Adição: Gera sourcemaps para debug build
    sourcemap: true,
  },
  // Adição: Força PostCSS se não detectado
  css: {
    postcss: './postcss.config.js',  // Assume que existe
  }
});