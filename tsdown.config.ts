import { readFileSync } from 'node:fs'

import { defineConfig } from 'tsdown'
import inlineEnum from 'unplugin-inline-enum/rolldown'

export default defineConfig([
  {
    dts: { oxc: true },
    tsconfig: './tsconfig.taglib.json',
    external: ['vite'],
    entry: [
      './src/index.ts',
      './src/vite.ts',
    ],
    exports: true,
    define: {
      __FS__: JSON.stringify('export default {}'),
      __SD__: JSON.stringify(readFileSync('./polyfills/string-decoder.js', 'utf-8')),
      __BF__: JSON.stringify(readFileSync('./polyfills/buffer-es6.js', 'utf-8')),
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
