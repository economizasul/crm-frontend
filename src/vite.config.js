// src/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': '/', // <-- FORÇA O ALIAS PARA A RAIZ DO PROJETO DENTRO DO RENDER
    },
  },
})