import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:3000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Proxy all backend route prefixes to the API gateway.
        // This avoids CORS issues during local development.
        // The frontend uses VITE_API_BASE_URL directly for production builds.
        '/auth': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/rbac': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/approval': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/ledger': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/customer': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/customer-accounts': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/wallet': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/batch': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/retry': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/payment': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/accounts': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/kyc': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/compliance': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/audit': { target: apiBaseUrl, changeOrigin: true, secure: false },
        '/loan': { target: apiBaseUrl, changeOrigin: true, secure: false },
      },
    },
  }
})
