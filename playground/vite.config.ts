import { defineConfig, splitVendorChunkPlugin } from 'vite'
import solid from 'vite-plugin-solid'
import uno from 'unocss/vite'
import { polyfillTaglib } from '../src/vite'

export default defineConfig(() => ({
  plugins: [
    solid(),
    uno(),
    polyfillTaglib(),
    splitVendorChunkPlugin(),
  ],
  build: {
    // minify: false,
    rollupOptions: {
      treeshake: true,
      // output: {
      //   manualChunks: (id) => {
      //     if (id.includes('node_modules/.pnpm') && !id.includes('solid')) {
      //       return id.split('node_modules/.pnpm/')[1].split('/')[0]
      //     }
      //   },
      // },
    },
  },
}))
