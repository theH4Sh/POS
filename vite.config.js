import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to remove crossorigin attributes from built HTML
// This is needed for Electron's file:// protocol to load CSS/JS correctly
function removeCrossOrigin() {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html) {
      return html.replace(/ crossorigin/g, '')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    removeCrossOrigin()
  ],
  build: {
    outDir: "renderer-dist",
    emptyOutDir: true
  }
})
