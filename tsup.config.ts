import { defineConfig } from 'tsup'

export default defineConfig(
  {
    clean: true,
    entry: {
      index: 'src/index.ts',
      utils: 'src/utils.ts',
      vite: 'src/vite.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    cjsInterop: true,
    shims: true,
    external: ['vite', 'esbuild'],
  },
)
