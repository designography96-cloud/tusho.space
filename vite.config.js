import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        motion: resolve(__dirname, 'motion.html'),
        brand: resolve(__dirname, 'brand.html'),
        web: resolve(__dirname, 'web.html'),
        work: resolve(__dirname, 'work.html'),
        case: resolve(__dirname, 'case-study.html'),
        about: resolve(__dirname, 'about.html'),
      },
    },
  },
})
