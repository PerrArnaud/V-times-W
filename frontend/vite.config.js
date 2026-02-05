import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        allowedHosts: ['v-times.beaupeyrat.com'],
        watch: {
            usePolling: true,
            interval: 100,
        },
        proxy: {
            '/api': {
                target: 'https://php',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
