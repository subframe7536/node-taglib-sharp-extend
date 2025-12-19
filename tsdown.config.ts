import { defineConfig } from 'tsdown'
import inlineEnum from 'unplugin-inline-enum/rolldown'

export default defineConfig([
  {
    format: ['cjs', 'esm'],
    dts: { oxc: true },
    tsconfig: './tsconfig.taglib.json',
    entry: [
      './src/index.ts',
      './src/vite.ts',
    ],
    exports: {
      customExports(exports) {
        exports['./buffer'] = './polyfills/buffer-es6.js'
        exports['./string-decoder'] = './polyfills/string-decoder.js'
        exports['.'] = Object.fromEntries(Object.entries(exports['.']).sort())
        exports['./vite'] = Object.fromEntries(Object.entries(exports['./vite']).sort())
        return exports
      },
    },
    plugins: [inlineEnum({
      scanDir: './node-taglib-sharp-memory/src',
      exclude: [
        '**/mpeg4BoxType.ts',
      ],
    })],
  },
])
