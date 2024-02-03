# node-taglib-sharp-extend

patched [node-taglib-sharp](https://github.com/benrr101/node-taglib-sharp) v5.2.3, add support for file in buffer

## Install

```shell
pnpm add node-taglib-sharp node-taglib-sharp-extend
```

## Usage

### Basic

```ts
import { File } from 'node-taglib-sharp-extend'

const file = File.createFromBuffer('test.mp3', buffer)
```

- fileAbstraction: `MemoryFileAbstraction`

### Utils

```ts
import {
  flushFile,
  getFileFromBuffer,
  parseMetadata,
  updatePicture,
  updateTag
} from 'node-taglib-sharp-extend/utils'

let file = getFileFromBuffer('test.mp3', buffer)

const { tag, property, pictures, quality } = parseMetadata(
  file,
  arr => arr.flatMap(a => a.split('; ')).join('')
)

updateTag(file, 'title', 'test')
updatePicture(file, buffer)

file = flushFile(file)
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

if you want to run in browser, you need to polyfill node modules and patch `node-taglib-sharp` for performance

#### Polyfills

there is a built-in vite plugin for polyfill, and please confirm that  [`vite-plugin-node-polyfills`](https://github.com/davidmyersdev/vite-plugin-node-polyfills) is installed

when dev,
default includes: `['buffer', 'string_decoder', 'stream', 'crypto', 'fs', 'path', 'util']`

when build,
default includes: `['buffer', 'string_decoder']`,
other modules are manually transformed by the plugin

default global: `{ Buffer: true }`

```ts
import { defineConfig } from 'vite'
import { polyfillTaglib } from 'node-taglib-sharp-extend/vite'

export default defineConfig(({ command }) => ({
  plugins: [
    polyfillTaglib({
      isBuild: command === 'build',
      // extra options
    }),
  ],
}))
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
