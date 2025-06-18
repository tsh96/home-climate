import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  base: 'home-climate/',
  server: {
    headers: { 'Cross-Origin-Embedder-Policy': 'unsafe-none' }
  },
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
