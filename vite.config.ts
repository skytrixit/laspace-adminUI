import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The panel is mounted under /admin on the same origin as the marketing site,
// so every asset URL has to be written relative to that base.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: { port: 5174, open: '/admin/' },
})
