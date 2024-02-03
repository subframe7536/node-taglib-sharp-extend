import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: {
    index: 'src/index.ts',
    vite: 'src/vite.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  outDir: './dist/main',
  treeshake: true,
  external: ['vite', 'esbuild', 'node-taglib-sharp-memory'],
  plugins: [
    {
      name: 'transform',
      renderChunk(code) {
        return {
          code: code.replace('node-taglib-sharp-memory/src', '../taglib/index.js'),
        }
      },
    },
  ],
})
