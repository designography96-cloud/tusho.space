import { defineConfig } from 'vite'
import { resolve } from 'path'

// GitHub Pages serves this repo at /tusho.space/ (a project page, not a user
// page), so the build needs that sub-path baked into Vite's own bundled
// script/style references. Every other internal link/asset path in the app is
// written relative (no leading slash) so it works at this sub-path today and
// at a domain root unchanged, if a custom domain is ever pointed here later.
export default defineConfig({
  base: '/tusho.space/',
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
