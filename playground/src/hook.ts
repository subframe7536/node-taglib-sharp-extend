import type { AnyFunction } from '@subframe7536/type-utils'
import {
  updatePicture as _updatePicture,
  updateTag as _updateTag,
  createFileFromBuffer,
  flushFile,
  getBufferFromFile,
  getPictureURL,
  type IParsedPicture,
  type Metadata,
  parseMetadata,
  type UpdateTagKey,
  type UpdateTagValue,
} from 'node-taglib-sharp-extend'
import { type Accessor, batch, createMemo, createResource, onCleanup } from 'solid-js'

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
    return createFileFromBuffer(
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
    const _picture = pictures?.[0]
    let picture: string | undefined
    if (!_picture) {
      picture = undefined
    } else {
      clean?.()
      ;[picture, clean] = getPictureURL(_picture)
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
