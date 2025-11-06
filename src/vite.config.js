// src/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  root: '.', // ← FORÇA O ROOT A SER A PASTA ATUAL (src/)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'), // ← @ = src/
    }
  }
})