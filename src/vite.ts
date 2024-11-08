import type { Plugin as VitePlugin } from 'vite'
import type { PolyfillOptions } from 'vite-plugin-node-polyfills'
import MagicString from 'magic-string'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/**
 * modules that need to be polyfilled at dev:
 * 'stream', 'crypto', 'fs', 'path', 'util',
 */
const DEV_POLYFILL_MODULES: Exclude<PolyfillOptions['include'], undefined> = [
  'stream',
  'crypto',
  'fs',
  'path',
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
      apply: isBuild === undefined
        ? 'build'
        : () => isBuild,
      transform: (code: string, id: string) => {
        if (id.includes('taglib-sharp-extend') && code.includes('import IConv from "iconv-lite"')) {
          const s = new MagicString(code)
          const result = s
            // replace node:crypto.randomFillSync with crypto.getRandomValues in matroskaAttachment.js
            .replace('import * as crypto from "crypto";', '')
            .replace('randomFillSync', 'getRandomValues')
            // remove fs/path
            .replace(/import \* as fs2? from "fs";/g, '')
            .replace('import * as Path from "path";', '')
            // remove useless node related class
            .replace(/(var [LocalFieAbstrn|Sm] = class \{[\s\S]*?\};)/, '')
            // remove createFromPath in taglib/files.js
            .replace(
              'return _File.createInternal(new LocalFileAbstraction(filePath), mimeType, propertiesStyle)',
              'throw new Error("cannot call createFromPath in browser")',
            )
            // remove fromPath in taglib/byteVector.js
            .replace(
              /utils.*Guards.truthy\(path, "path"\);/g,
              'throw new Error("cannot call fromPath in browser")',
            )
            // remove fromPath in taglib/picture.js
            .replace(
              /utils.*Guards.truthy\(filePath, ".*?"\);/gi,
              'throw new Error("cannot call fromPath in browser")',
            )
            // polyfill path deps taglib/utils.js
            .replace(
              /path.extname\(name\)/gi,
              'name.replace("/\\\\/g", "/").match(/.(\\.[^./]+)$/)?.[1]',
            )
          return {
            code: result.toString(),
            map: result.generateMap({ hires: true, source: id }),
          }
        }

        // remove stream polyfill, no sourcemap
        if (id.endsWith('iconv-lite/lib/index.js')) {
          return code
            .replace('stream_module = require("stream");', '')
            // .replace('stream_module = require_stream();', '')
        }
      },
    },
    nodePolyfills({
      ...rest,
      globals: { ...extraGlobals, Buffer: true },
      include,
    }),
  ]
}
