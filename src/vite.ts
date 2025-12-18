import type { Plugin as VitePlugin } from 'vite'

const POLYFILL_PREFIX = 'taglib-polyfill'
const POLYFILL_PREFIX_RESOLVED = `\0${POLYFILL_PREFIX}:`
const REG_POLYFILL_MATCH = new RegExp(POLYFILL_PREFIX_RESOLVED)
declare const __FS__: string
declare const __SD__: string
declare const __BF__: string

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
export async function polyfillTaglib(): Promise<VitePlugin<any>> {
  let MagicString
  try {
    MagicString = (await import('magic-string')).default
  } catch {
    throw new Error('Cannot import MagicString, it is necessory for vite plugin')
  }
  return {
    name: 'taglib-sharp-polyfill',
    enforce: 'pre',
    resolveId: {
      filter: {
        id: [/^fs$/, /^string_decoder$/, /^buffer$/],
      },
      handler(source) {
        return `${POLYFILL_PREFIX_RESOLVED}${source}`
      },
    },
    load: {
      filter: {
        id: REG_POLYFILL_MATCH,
      },
      handler(id) {
        id = id.replace(REG_POLYFILL_MATCH, '')
        switch (id) {
          case 'fs':
            return __FS__
          case 'string_decoder':
            return __SD__
          case 'buffer':
            // eslint-disable-next-line prefer-template
            return 'if (typeof global === "undefined") window.global = window;\n' + __BF__
        }
      },
    },
    transform: {
      filter: {
        id: /node-taglib-sharp-extend\/dist/,
        code: /import \* as crypto from ["']crypto["'];/,
      },
      handler(code: string) {
        const s = new MagicString(code)
          // replace node:crypto.randomFillSync with crypto.getRandomValues in matroskaAttachment.js
          .replace(/import \* as crypto from ["']crypto["'];/, '')
          .replace('randomFillSync', 'getRandomValues')
          // remove fs
          .replace(/import \* as fs from ["']fs["'];/, '')
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true }),
        }
      },
    },
  }
}

/**
 * Config for `build.rollupOptions.output.manualChunks`
 */
export const taglibManualChunksConfig: Record<string, string[]> = {
  iconv: ['@subframe7536/iconv-lite'],
  taglib: ['node-taglib-sharp-extend'],
}

/**
 * Config for rolldown-vite's `advancedChunks`
 */
export const taglibAdvancedChunksConfig: any[] = [
  {
    name: 'iconv',
    test: '@subframe7536/iconv-lite',
  },
  {
    name: 'taglib',
    test: 'node-taglib-sharp-extend',
  },
]
