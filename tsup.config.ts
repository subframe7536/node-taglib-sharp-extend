import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/vite.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  cjsInterop: true,
  shims: true,
  treeshake: true,
  tsconfig: './tsconfig.taglib.json',
  external: ['vite', 'esbuild'],
})
