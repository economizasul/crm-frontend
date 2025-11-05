// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // FORÇADO: 'src' sem ./ para evitar src/src
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },

  base: './',

  build: {
    rollupOptions: {
      external: [],
    },
    sourcemap: true,
  },

  css: {
    postcss: './postcss.config.cjs',
  },
});