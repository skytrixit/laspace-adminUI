/// <reference types="vite/client" />

// Variables the panel reads from .env — see .env.example. VITE_DEV_PORT,
// VITE_API_PROXY_TARGET and VITE_BASE_PATH are consumed by vite.config.ts only.
interface ImportMetaEnv {
  /** Where the browser sends API calls. Default `/api`. */
  readonly VITE_API_BASE?: string
}
