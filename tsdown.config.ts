import type { UserConfig } from 'tsdown'

import { defineConfig } from 'tsdown'
import inlineEnum from 'unplugin-inline-enum'

export default defineConfig([
  {
    dts: { oxc: true },
    tsconfig: './tsconfig.taglib.json',
    external: ['vite', 'esbuild', 'crypto', 'fs'],
    entry: [
      './src/index.ts',
      './src/vite.ts',
    ],
    plugins: [inlineEnum.rolldown({
      scanDir: './node-taglib-sharp-memory/src',
      include: [
        './node-taglib-sharp-memory/src/*.ts',
        './node-taglib-sharp-memory/src/{ape,asf,flac,id3v2,matroska,mpeg,mpeg4,ogg,riff}/**/*.ts',
      ],
    })],
  },
])
