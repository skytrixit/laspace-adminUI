import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // .env and .env.<mode> in the project root — see .env.example for every key.
  // '.' is the root Vite runs in; process.cwd() would need @types/node.
  const env = loadEnv(mode, '.', '')
  // The panel is mounted under /admin on the same origin as the marketing site,
  // so every asset URL has to be written relative to that base. The router's
  // basename in src/App.tsx derives from it through import.meta.env.BASE_URL.
  const base = env.VITE_BASE_PATH || '/admin/'

  return {
    base,
    plugins: [react()],
    server: {
      port: Number(env.VITE_DEV_PORT) || 5174,
      open: base,
      /* Same-origin /api in the browser, forwarded to the Nest API in dev. */
      proxy: { '/api': env.VITE_API_PROXY_TARGET || 'http://localhost:4000' },
    },
  }
})
