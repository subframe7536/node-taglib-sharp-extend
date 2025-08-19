import type { Plugin as VitePlugin } from 'vite'
import type { PolyfillOptions } from 'vite-plugin-node-polyfills'

import MagicString from 'magic-string'

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
export async function polyfillTaglib(
  extraOptions: PolyfillOptions & { isBuild?: boolean } = {},
): Promise<VitePlugin<any>[]> {
  const {
    isBuild,
    include = [],
    globals: extraGlobals,
    ...rest
  } = extraOptions

  include.push('buffer', 'string_decoder')

  if (!isBuild) {
    include.push(...DEV_POLYFILL_MODULES)
  }

  let nodePolyfills
  try {
    nodePolyfills = await import('vite-plugin-node-polyfills').then(m => m.nodePolyfills)
  } catch {
    throw new Error('Package `vite-plugin-node-polyfills` is not installed')
  }

  return [
    {
      name: 'taglib-sharp-polyfill',
      enforce: 'pre',
      // apply: isBuild === undefined
      //   ? 'build'
      //   : () => isBuild,
      transform: {
        filter: {
          id: /node-taglib-sharp-extend\/dist/,
          code: /import \* as crypto from ["']crypto["'];/,
        },
        handler(code: string) {
          return replaceNativeModules(code)
        },
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

/**
 * Config for `build.rollupOptions.output.manualChunks`
 */
export const taglibAdvancedChunksConfig = [
  {
    name: 'iconv',
    test: '@subframe7536/iconv-lite',
  },
  {
    name: 'taglib',
    test: 'node-taglib-sharp-extend',
  },
]

export function replaceNativeModules(code: string): { code: string, map: any } {
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
}
