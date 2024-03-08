import MagicString from 'magic-string'
import type { Plugin as VitePlugin } from 'vite'
import type { PolyfillOptions } from 'vite-plugin-node-polyfills'
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
      transform: (code, id) => {
        const transformCode = (fn: (s: MagicString) => MagicString) => {
          const s = new MagicString(code)
          const result = fn(s)
          return {
            code: result.toString(),
            map: result.generateMap({ hires: true, source: id }),
          }
        }

        // replace node:crypto.randomFillSync with crypto.getRandomValues
        if (id.endsWith('matroskaAttachment.js')) {
          return transformCode(c => c
            // .replace('const crypto = require("crypto");', '')
            .replace('import * as crypto from "crypto";', '')
            .replace('randomFillSync', 'getRandomValues'))
        }

        // remove useless localFileAbstraction
        if (id.endsWith('taglib/fileAbstraction.js')) {
          return transformCode(c => c.remove(0, c.length()))
        }

        // #region for dev

        if (id.endsWith('taglib/index.js')) {
          return transformCode(c => c
            .replace('export { LocalFileAbstraction } from "./fileAbstraction";', ''))
        }
        if (id.endsWith('taglib/file.js')) {
          return transformCode(c => c
            .replace('import { LocalFileAbstraction } from "./fileAbstraction";', '')
            .replace(
              /return File.createInternal\(.*?LocalFileAbstraction.*?\);/gi,
              'throw new Error("cannot call createFromPath in browser")',
            ))
        }

        // remove useless Stream
        if (id.endsWith('taglib/stream.js')) {
          return transformCode(c => c
            // .replace('const fs = require("fs");', '')
            .replace('import * as fs from "fs"', '')
            .replace(/export class[\s\S]+/gm, ''))
        }

        // remove stream polyfill, no sourcemap
        if (id.endsWith('iconv-lite/lib/index.js') || id.includes('iconv-lite.js')) {
          return code
            .replace('stream_module = require("stream");', '')
            // .replace('stream_module = require_stream();', '')
        }

        // remove fs polyfill
        if (id.endsWith('taglib/byteVector.js')) {
          return transformCode(c => c
            // .replace('const fs = require("fs");', '')
            .replace('import * as fs from "fs"', '')
            .replace(
              /utils.*Guards.truthy\(path, "path"\);/g,
              'throw new Error("cannot call fromPath in browser")',
            ))
        }

        // remove path polyfill
        if (id.endsWith('taglib/picture.js')) {
          return transformCode(c => c
            // .replace(/const path = require\("path"\);/gi, '')
            .replace(/import \* as Path from "path";/gi, '')
            .replace(
              /utils.*Guards.truthy\(filePath, ".*?"\);/gi,
              'throw new Error("cannot call fromPath in browser")',
            )
            .replace('import { LocalFileAbstraction } from "./fileAbstraction";', ''))
        }

        // remove path polyfill
        if (id.endsWith('taglib/utils.js')) {
          return transformCode(c => c
            // .replace(/const path = require\("path"\);/gi, '')
            .replace(/import \* as Path from "path";/gi, '')
            .replace(
              /path.extname\(name\)/gi,
              'name.replace("/\\\\/g", "/").match(/.(\\.[^./]+)$/)?.[1]',
            ))
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
