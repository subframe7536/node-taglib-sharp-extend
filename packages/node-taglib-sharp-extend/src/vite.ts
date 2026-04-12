import { createRequire } from 'node:module'

import type { Plugin as VitePlugin, UserConfig } from 'vite'

import { name } from '../../../package.json'

/**
 * @deprecated set via vite plugin option
 * Config for `build.rollupOptions.output.manualChunks`
 */
export const taglibManualChunksConfig: Record<string, string[]> = {
  iconv: ['@subframe7536/iconv-lite'],
  taglib: ['node-taglib-sharp-extend'],
}

/**
 * @deprecated set via vite plugin option
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

export interface TaglibVitePluginOptions {
  /**
   * Whether to apply polyfill for node-taglib-sharp-extend
   *
   * `magic-string` is required.
   * @default true
   */
  polyfill?: boolean
  /**
   * Whether to enable code splitting for node-taglib-sharp-extend and its dependencies, which can improve caching and reduce initial bundle size, but may increase the number of requests and complexity of the build process.
   * @default true
   */
  codeSplitting?: boolean
}

/**
 * Polyfill vite plugin for node-taglib-sharp-extend
 *
 * @example
 * import { defineConfig } from 'vite'
 * import { taglib } from 'node-taglib-sharp-extend/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     taglib(),
 *   ],
 * })
 */
export async function taglib(options: TaglibVitePluginOptions = {}): Promise<VitePlugin<any>> {
  const { polyfill = true, codeSplitting = true } = options
  let MagicString: typeof import('magic-string').default
  if (polyfill) {
    try {
      MagicString = (await import('magic-string')).default
    } catch {
      throw new Error('Cannot import MagicString, it is necessory for vite plugin')
    }
  }
  return {
    name: 'taglib-sharp-polyfill',
    enforce: 'pre',
    config() {
      const result: UserConfig = {}
      if (polyfill) {
        const res = createRequire(import.meta.url).resolve
        result.resolve = {
          alias: {
            buffer: res(`${name}/buffer`),
            string_decoder: res(`${name}/string-decoder`),
          },
        }
      }
      if (codeSplitting) {
        result.build = {
          rollupOptions: {
            output: {
              codeSplitting: {
                groups: [
                  {
                    name: 'iconv',
                    test: '@subframe7536/iconv-lite',
                  },
                  {
                    name: 'taglib',
                    test: 'node-taglib-sharp-extend',
                  },
                ],
              },
            },
          },
        }
      }
      return result
    },
    transform: polyfill
      ? {
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
        }
      : undefined,
  }
}
