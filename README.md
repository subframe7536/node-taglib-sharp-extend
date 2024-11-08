# node-taglib-sharp-extend

patch [node-taglib-sharp](https://github.com/benrr101/node-taglib-sharp) and add support for file in buffer

backup your file!

known issue:
- `m4a` maybe corrupt after writing, see [original issue](https://github.com/benrr101/node-taglib-sharp/issues/103#issuecomment-1987243846)

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

### Extra function compare to origin

```ts
import { File } from 'node-taglib-sharp-extend'

const file = File.createFromBuffer('test.mp3', buffer)
```

- fileAbstraction: `MemoryFileAbstraction`

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
} from 'node-taglib-sharp-extend/utils'

let file = getFileFromBuffer('test.mp3', buffer)

const { tag, property, pictures, quality, unwritableReason } = parseMetadata(
  file,
  arr => arr.flatMap(a => a.split('; ')).join('')
)

updateTag(file, 'title', 'test')
updatePicture(file, buffer)

// if File is created from buffer and corrupt after flusing, throw CorruptError
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

export type Metadata<T extends string | string[] = string[]> = {
  tag: IAudioTag<T>
  property: IAudioProperty
  quality: AudioQualityType
  pictures?: IParsedPicture[]
}
```

more utils are documented by JSDoc

### Run in browser

if you want to run in browser, you need to do some polyfills for node modules

total size: ~270KB (minified + gzip)

#### Polyfills

there is a built-in vite plugin for polyfill, and please ensure that [`vite-plugin-node-polyfills`](https://github.com/davidmyersdev/vite-plugin-node-polyfills) is installed

when dev,
default includes: `['buffer', 'string_decoder', 'stream', 'crypto', 'fs', 'path', 'util']`

when build,
default includes: `['buffer', 'string_decoder']`,
other modules are manually transformed by the plugin

default global: `{ Buffer: true }`

vite config:
```ts
import { polyfillTaglib } from 'node-taglib-sharp-extend/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    polyfillTaglib(/* options */),
  ],
})
```

##### Web Worker support check

Matroska / WebM use `node:crypto.randomFillSync()` to generate random array, it is polyfilled to `crypto.getRandomValues`.

you can use built-in function to check if support in Web Worker:

```ts
import { checkWebWorkerSupport } from 'node-taglib-sharp-extend/utils'

// you can run in main thread or worker thread
if (await checkWebWorkerSupport()) {
  // ...
}
```
