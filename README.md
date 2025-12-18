# node-taglib-sharp-extend

Patch [node-taglib-sharp](https://github.com/benrr101/node-taglib-sharp) with:

- Some utils with corrected types, narrow exports
- Read / Write support for file in buffer, detach `createFromPath` in `File`
- Fresh dependencies and reduce `Node` dependencies
- Provide `Vite` plugin for webapp

Backup your file!

Known issue:
- ~~`m4a` maybe corrupt after writing, see [original issue](https://github.com/benrr101/node-taglib-sharp/issues/103#issuecomment-1987243846)~~ Seems be solved, see [original PR](https://github.com/benrr101/node-taglib-sharp/pull/108)

## Install

```shell
npm install node-taglib-sharp-extend
```
```shell
yarn add node-taglib-sharp-extend
```
```shell
pnpm add node-taglib-sharp-extend
```

## Usage

```ts
import { createFileFromBuffer, createFileFromPath } from 'node-taglib-sharp-extend'

const localFile = await createFileFromPath('./samples/test.mp3')
const file = await createFileFromBuffer('test.mp3', buffer)
```

### Utils

```ts
import {
  flushFile,
  getBufferFromFile,
  getFileFromBuffer,
  getPictureBase64,
  getPictureURL,
  parseMetadata,
  updatePicture,
  updateTag
} from 'node-taglib-sharp-extend'

let file = getFileFromBuffer('test.mp3', buffer)

const { tag, property, pictures, quality, unwritableReason } = parseMetadata(
  file,
  arr => arr.flatMap(a => a.split('; ')).join('')
)

updateTag(file, 'title', 'test')
updatePicture(file, buffer)

// if `File` is created from buffer and corrupt after flushing, throw `CorruptError`
file = flushFile(file)
console.log('file size:', getBufferFromFile(file).length)

// browser only
const [url, clean] = getPictureURL(pictures[0])
console.log(url)
clean()

const base64 = await getPictureBase64(pictures[0])
```

#### Types

```ts
export type IAudioTag<T extends string | string[] = string[]> = Partial<{
  title: string
  artists: T
  album: string
  track: number
  trackTotal: number
  disk: number
  diskTotal: number
  year: number
  genres: T
  albumArtists: T
  composers: T
  comment: string
  lyrics: string
}>

export type IAudioProperty = {
  bitRate: number
  bitsPerSample: number
  sampleRate: number
  duration: number
  channels: number
  codecs: ICodec[]
}

export type AudioQualityType = 'HQ' | 'Hi-Res' | 'SQ'

export type Metadata<T extends string | string[] = string[]> = {
  tag: IAudioTag<T>
  property: IAudioProperty
  quality: AudioQualityType
  pictures?: IParsedPicture[]
}
```

More utils are documented by JSDoc

### Run in browser

If you want to run it in webapp, you need to do some polyfills for node modules

Total size: ~250KB (minified + gzip)

#### Polyfills

There is a built-in vite plugin for polyfill, handling `buffer` and `string_decoder`. `fs` and `crypto` will be transformed.

```ts
// vite.config.ts
import { polyfillTaglib } from 'node-taglib-sharp-extend/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    polyfillTaglib({ optimizeChunk: true /* default */ }),
  ],
})
```

#### Web Worker support check

Matroska / WebM use `node:crypto.randomFillSync()` to generate random array, it is polyfilled to `crypto.getRandomValues`.

you can use built-in function to check if support in Web Worker:

```ts
import { checkWebWorkerSupport } from 'node-taglib-sharp-extend'

// you can run in main thread or worker thread
if (await checkWebWorkerSupport()) {
  // ...
}
```
