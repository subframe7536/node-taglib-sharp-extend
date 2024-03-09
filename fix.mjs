import { readFileSync, writeFileSync } from 'node:fs'

/**
 *
 * @param {string} path
 * @param {(code: string) => string} fn
 */
function transform(path, fn) {
  const code = readFileSync(path, 'utf8')
  writeFileSync(path, fn(code))
  console.log(`fix ${path}`)
}

console.log('build patched taglib success')
; ['d.ts', 'd.cts'].forEach((ext) => {
  const p = `./dist/main/index.${ext}`
  transform(p, code => code.replace('node-taglib-sharp-memory/src', '../taglib/index.d.ts'))
})

transform('./dist/taglib/byteVector.js', code => code.replace('* as IConv', 'IConv'))
