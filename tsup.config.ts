import { defineConfig } from 'tsup'
import inlineEnum from 'unplugin-inline-enum'

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/vite.ts',
  ],
  format: ['esm', 'cjs'],
  clean: true,
  dts: true,
  cjsInterop: true,
  shims: true,
  treeshake: true,
  tsconfig: './tsconfig.taglib.json',
  external: ['vite', 'esbuild', 'crypto', 'fs'],
  esbuildPlugins: [inlineEnum.esbuild({
    scanDir: './node-taglib-sharp-memory/src',
    include: [
      './node-taglib-sharp-memory/src/*.ts',
      './node-taglib-sharp-memory/src/{ape,asf,flac,id3v2,matroska,mpeg,mpeg4,ogg,riff}/**/*.ts',
    ],
  })],
})
