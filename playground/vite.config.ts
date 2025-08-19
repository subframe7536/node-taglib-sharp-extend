import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

import { polyfillTaglib, taglibManualChunksConfig } from '../src/vite'

export default defineConfig({
  plugins: [
    solid(),
    uno(),
    polyfillTaglib(),
  ],
  build: {
    // minify: false,
    rollupOptions: {
      output: {
        manualChunks: taglibManualChunksConfig,
      },
    },
  },
})
