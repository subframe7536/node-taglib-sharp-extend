import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { build } from 'tsup'

const buildTimeSrcPath = '__src'
const buildTimeTaglibPath = '__taglib'

await cp('./node_modules/node-taglib-sharp-memory/src', buildTimeTaglibPath, { recursive: true })
await cp('src', buildTimeSrcPath, { recursive: true })

const utilPath = join(buildTimeSrcPath, 'utils.ts')
const utilsCode = await readFile(utilPath, 'utf-8')
await writeFile(utilPath, utilsCode.replaceAll('node-taglib-sharp-memory/src', `../${buildTimeTaglibPath}`))

const indexPath = join(buildTimeSrcPath, 'index.ts')
const indexCode = await readFile(indexPath, 'utf-8')
await writeFile(indexPath, indexCode.replaceAll('node-taglib-sharp-memory/src', `../${buildTimeTaglibPath}`))

await build({
  entry: {
    index: join(buildTimeSrcPath, 'index.ts'),
    utils: join(buildTimeSrcPath, 'utils.ts'),
    vite: join(buildTimeSrcPath, 'vite.ts'),
  },
  format: ['esm', 'cjs'],
  dts: true,
  cjsInterop: true,
  shims: true,
  tsconfig: './tsconfig.taglib.json',
  external: ['vite', 'esbuild'],
})

await rm(buildTimeSrcPath, { recursive: true })
await rm(buildTimeTaglibPath, { recursive: true })
