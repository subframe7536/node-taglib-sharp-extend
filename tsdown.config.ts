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
        return exports
      },
    },
    plugins: [inlineEnum({
      scanDir: './node-taglib-sharp-memory/src',
      include: [
        './node-taglib-sharp-memory/src/*.ts',
        './node-taglib-sharp-memory/src/{ape,asf,flac,id3v2,matroska,mpeg,mpeg4,ogg,riff}/**/*.ts',
      ],
    })],
  },
])
