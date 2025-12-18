import type { Plugin as VitePlugin } from 'vite'

import { createRequire } from 'node:module'

import { name } from '../package.json'

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

const req = createRequire(import.meta.url)

/**
 * Polyfill vite plugin for node-taglib-sharp-extend
 *
 * @example
 * import { defineConfig } from 'vite'
 * import { polyfillTaglib } from 'node-taglib-sharp-extend/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     polyfillTaglib(),
 *   ],
 * })
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
    config() {
      return {
        resolve: {
          alias: {
            buffer: req.resolve(`${name}/buffer`),
            string_decoder: req.resolve(`${name}/string-decoder`),
          },
        },
      }
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
