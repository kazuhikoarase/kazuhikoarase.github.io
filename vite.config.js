import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

const input = { main: resolve(__dirname, 'index.html') };

export default defineConfig({
  server: {
    port : 8192
  },
  build: {
    outDir: './docs',
    rollupOptions: {
      input: input,
      output: {
      }
    },
  },

});
