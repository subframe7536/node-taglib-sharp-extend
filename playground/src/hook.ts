import {
  type IParsedPicture,
  type Metadata,
  type UpdateTagKey,
  type UpdateTagValue,
  updatePicture as _updatePicture,
  updateTag as _updateTag,
  flushFile,
  getBufferFromFile,
  getFileFromBuffer,
  getPictureURL,
  parseMetadata,
} from 'node-taglib-sharp-extend/utils'
import { type Accessor, batch, createMemo, createResource, onCleanup } from 'solid-js'
import type { AnyFunction } from '@subframe7536/type-utils'

function downloadUint8ArrayAsFile(uint8Array: Uint8Array, fileName: string) {
  const url = URL.createObjectURL(
    new Blob([uint8Array], { type: 'application/octet-stream' }),
  )

  const link = document.createElement('a')
  link.href = url
  link.download = fileName

  link.click()
  URL.revokeObjectURL(url)
}

type Result = [
  Accessor<Omit<Metadata, 'pictures'> & {
    picture?: string
  } | undefined>,
  {
    updateTag: <T extends UpdateTagKey>(key: T, value: UpdateTagValue<T>) => void
    updatePicture: (file: File) => Promise<void>
    download: VoidFunction
  },
]

export function useMetadata(
  file: Accessor<File | undefined>,
): Result {
  const [metaFile, { mutate }] = createResource(file, async (file) => {
    return getFileFromBuffer(
      file.name,
      new Uint8Array(await file.arrayBuffer()),
    )
  })
  let clean: AnyFunction
  const metadata = createMemo(() => {
    const meta = metaFile()
    if (!meta) {
      return undefined
    }
    const { pictures, ...rest } = parseMetadata(meta, arr => arr.flatMap(a => a.split('; ')))
    let picture: string | IParsedPicture | undefined = pictures?.[0]
    if (!picture) {
      picture = undefined
    } else {
      clean?.()
      ;[picture, clean] = getPictureURL(picture)
      onCleanup(clean)
    }
    return { ...rest, picture }
  })

  function updateTag<T extends UpdateTagKey>(key: T, value: UpdateTagValue<T>) {
    const meta = metaFile()
    if (!meta) {
      return
    }
    _updateTag(meta, key, value)
    mutate(flushFile(meta))
  }

  async function updatePicture(file: File) {
    const meta = metaFile()
    if (!meta) {
      return
    }
    const buffer = new Uint8Array(await file.arrayBuffer())
    batch(() => _updatePicture(meta, buffer, file.name))
    mutate(flushFile(meta))
  }
  function download() {
    const meta = metaFile()
    if (!meta) {
      return
    }
    return downloadUint8ArrayAsFile(getBufferFromFile(meta)!, meta.name)
  }

  return [metadata, { updateTag, updatePicture, download }]
}
