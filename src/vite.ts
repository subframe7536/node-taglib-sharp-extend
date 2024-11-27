import type { Plugin as VitePlugin } from 'vite'
import type { PolyfillOptions } from 'vite-plugin-node-polyfills'
import MagicString from 'magic-string'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/**
 * modules that need to be polyfilled at dev:
 * 'stream', 'crypto', 'fs', 'util',
 */
const DEV_POLYFILL_MODULES: Exclude<PolyfillOptions['include'], undefined> = [
  'stream',
  'crypto',
  'fs',
  'util',
]

/**
 * please make sure you have installed `vite-plugin-node-polyfills`
 *
 * when dev,
 * default includes: `['buffer', 'string_decoder', 'stream', 'crypto', 'fs', 'path', 'util']`
 *
 * when build,
 * default includes: `['buffer', 'string_decoder']`,
 * other modules are manually transformed by the plugin
 *
 * default global: `{ Buffer: true }`
 * @example
 * import { defineConfig } from 'vite'
 * import { polyfillTaglib } from 'node-taglib-sharp-extend/vite'
 *
 * export default defineConfig(({ command }) => ({
 *   plugins: [
 *     polyfillTaglib({
 *       isBuild: command === 'build',
 *       // extra options
 *     }),
 *   ],
 * }))
 */
export function polyfillTaglib(
  extraOptions: PolyfillOptions & { isBuild?: boolean } = {},
): VitePlugin[] {
  const {
    isBuild,
    include = [],
    globals: extraGlobals,
    ...rest
  } = extraOptions

  include.push('buffer', 'string_decoder')

  !isBuild && include.push(...DEV_POLYFILL_MODULES)

  return [
    {
      name: 'taglib-sharp-polyfill',
      enforce: 'pre',
      apply: isBuild === undefined
        ? 'build'
        : () => isBuild,
      transform(code: string, id: string) {
        // remove stream polyfill, no sourcemap
        if (!id.includes('node-taglib-sharp-extend/dist')) {
          return
        }
        if (code.match(/import \* as crypto from ["']crypto["'];/)) {
          // replace node:crypto.randomFillSync with crypto.getRandomValues in matroskaAttachment.js
          const s = new MagicString(code)
            .replace(/import \* as crypto from ["']crypto["'];/, '')
            .replace('randomFillSync', 'getRandomValues')
            // remove fs
            .replace(/import \* as fs from ["']fs["'];/, '')
            // .replace('import * as Path from "path";', '')
            // // remove useless node related class
            // .replace(/(var [LocalFieAbstrn|Sm] = class \{[\s\S]*?\};)/, '')
            // // remove createFromPath in taglib/files.js
            // .replace(
            //   'return _File.createInternal(new LocalFileAbstraction(filePath), mimeType, propertiesStyle)',
            //   'throw new Error("cannot call createFromPath in browser")',
            // )
            // // remove fromPath in taglib/byteVector.js
            // .replace(
            //   /utils.*Guards.truthy\(path, "path"\);/g,
            //   'throw new Error("cannot call fromPath in browser")',
            // )
            // // remove fromPath in taglib/picture.js
            // .replace(
            //   /utils.*Guards.truthy\(filePath, ".*?"\);/gi,
            //   'throw new Error("cannot call fromPath in browser")',
            // )
            // // polyfill path deps taglib/utils.js
            // .replace(
            //   /path.extname\(name\)/gi,
            //   'name.replace("/\\\\/g", "/").match(/.(\\.[^./]+)$/)?.[1]',
            // )
          return {
            code: s.toString(),
            map: s.generateMap({ hires: true, source: id }),
          }
        }
      },
    },
    nodePolyfills({
      ...rest,
      globals: extraGlobals,
      include,
    }),
  ]
}

/**
 * Config for `build.rollupOptions.output.manualChunks`
 */
export const taglibManualChunksConfig = {
  iconv: ['@subframe7536/iconv-lite'],
  taglib: ['node-taglib-sharp-extend'],
}
