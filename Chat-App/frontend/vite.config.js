import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // sockjs-client is a CommonJS bundle that references Node's `global`.
  // This one-liner polyfills it for the browser at build time.
  define: { global: 'globalThis' },
})
