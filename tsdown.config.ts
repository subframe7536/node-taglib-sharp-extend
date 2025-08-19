import type { UserConfig } from 'tsdown'

import { defineConfig } from 'tsdown'
import inlineEnum from 'unplugin-inline-enum'

const config: UserConfig = {
  dts: true,
  treeshake: true,
  minify: {
    compress: true,
  },
  tsconfig: './tsconfig.taglib.json',
  external: ['vite', 'esbuild', 'crypto', 'fs'],
}

export default defineConfig([
  {
    ...config,
    entry: [
      './src/index.ts',
    ],
    format: ['cjs', 'esm'],
    plugins: [inlineEnum.rolldown({
      scanDir: './node-taglib-sharp-memory/src',
      include: [
        './node-taglib-sharp-memory/src/*.ts',
        './node-taglib-sharp-memory/src/{ape,asf,flac,id3v2,matroska,mpeg,mpeg4,ogg,riff}/**/*.ts',
      ],
    })],
  },
  {
    ...config,
    entry: [
      './src/vite.ts',
    ],
  },
])
