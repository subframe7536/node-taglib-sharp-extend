import { defineConfig } from 'tsdown'
import inlineEnum from 'unplugin-inline-enum/rolldown'

export default defineConfig({
  dts: { parallel: true },
  tsconfig: './tsconfig.taglib.json',
  entry: ['./src/index.ts', './src/vite.ts'],
  deps: {
    skipNodeModulesBundle: true,
  },
  exports: {
    customExports: {
      './buffer': './polyfills/buffer-es6.js',
      './string-decoder': './polyfills/string-decoder.js',
    },
  },
  plugins: [
    inlineEnum({
      scanDir: './node-taglib-sharp-memory/src',
      exclude: ['**/mpeg4BoxType.ts'],
    }),
  ],
})
