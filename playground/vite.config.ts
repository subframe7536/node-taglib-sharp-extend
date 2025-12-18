import { polyfillTaglib, taglibManualChunksConfig } from 'node-taglib-sharp-extend/vite'
import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solid(),
    uno(),
    polyfillTaglib() as any,
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
