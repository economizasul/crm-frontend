// vite.config.js (NA RAIZ DO REPOSITÓRIO)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'src/dist'
  }
})