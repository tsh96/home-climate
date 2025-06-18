import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: 'home-climate/',
  server: {
    headers: { 'Cross-Origin-Embedder-Policy': 'unsafe-none' }
  },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({ registerType: 'autoUpdate' })
  ],
})
