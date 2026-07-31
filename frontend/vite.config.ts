import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Deploy under a subpath (GitHub Pages: FACEVAULT_BASE=facevault) or at root
// (local/APK: unset). We read the value WITHOUT a leading slash so Git Bash's
// MSYS layer never mangles it into a Windows path.
const rawBase = process.env.FACEVAULT_BASE || ''
const base = rawBase ? `/${rawBase.replace(/^\/+|\/+$/g, '')}/` : '/'

// Resolve a root-relative asset path against the configured base.
const asset = (p: string) => `${base}${p.replace(/^\//, '')}`

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'FaceVault',
        short_name: 'FaceVault',
        description:
          'Local AI face analysis, golden-ratio scoring and digital avatar studio. Your face never leaves your device.',
        theme_color: '#0b0e14',
        background_color: '#0b0e14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        icons: [
          { src: asset('icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: asset('icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: asset('icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: asset('icon.svg'), sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,wasm,json}'],
        maximumFileSizeToCacheInBytes: 16 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.monkeycode-ai.live'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: ['.monkeycode-ai.live'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
})
