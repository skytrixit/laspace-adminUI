import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The panel is mounted under /admin on the same origin as the marketing site,
// so every asset URL has to be written relative to that base.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: {
    port: 5174,
    open: '/admin/',
    /* Same-origin /api in the browser, forwarded to the Nest API in dev. */
    proxy: { '/api': 'http://localhost:4000' },
  },
})
