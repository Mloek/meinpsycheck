import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'meinpsycheck_icon_192.png'],
      manifest: {
        name: 'MeinPsyCheck',
        short_name: 'PsyCheck',
        description: 'Wissenschaftlich fundiertes Screening für psychische Gesundheit',
        start_url: '/',
        display: 'standalone',
        background_color: '#2A0A4E',
        theme_color: '#5B21B6',
        lang: 'de',
        icons: [
          {
            src: 'meinpsycheck_icon_192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
