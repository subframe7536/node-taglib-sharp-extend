import { readFileSync, writeFileSync } from 'node:fs'

console.log('build patched taglib success')
; ['d.ts', 'd.cts'].forEach((ext) => {
  const p = `./dist/main/index.${ext}`
  const code = readFileSync(p, 'utf8')
  writeFileSync(p, code.replace('node-taglib-sharp-memory/src', '../taglib/index.d.ts'))
  console.log('fix taglib type import path in', p)
})
