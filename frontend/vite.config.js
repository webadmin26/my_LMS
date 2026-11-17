import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [".devtunnels.ms"],
    proxy: {
      "/books": "http://127.0.0.1:8000",
      "/shelves": "http://127.0.0.1:8000",
      "/openlibrarysearch": "http://127.0.0.1:8000",
    },
  },
})