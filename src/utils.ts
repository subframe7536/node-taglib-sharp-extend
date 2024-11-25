import type { IPicture } from '../node-taglib-sharp-memory/src'
import { ByteVector, File, MediaTypes, MemoryFileAbstraction, Picture, PictureType } from '../node-taglib-sharp-memory/src'

export type AudioQualityType = 'HQ' | 'Hi-Res' | 'SQ'

export type IParsedPicture = Omit<IPicture, 'data' | 'type'> & {
  data: Uint8Array
  coverType: PictureType
}

/**
 * tag key map
 */
export const AudioTagMap = {
  title: 'title',
  artists: 'performers',
  album: 'album',
  track: 'track',
  trackTotal: 'trackCount',
  disk: 'disc',
  diskTotal: 'discCount',
  year: 'year',
  genres: 'genres',
  albumArtists: 'albumArtists',
  composers: 'composers',
  comment: 'comment',
  lyrics: 'lyrics',
} as const

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
  /**
   * audio avarage bit rate in integer (kbps)
   */
  bitRate: number
  /**
   * audio bit depth
   */
  bitDepth: number
  /**
   * audio sample rate
   */
  sampleRate: number
  /**
   * milesecond in integer
   */
  duration: number
  /**
   * audio channel number
   */
  channels: number
  /**
   * codec description list
   */
  codecs: string[]
}

export type Metadata<T extends string | string[] = string[]> = {
  /**
   * audio tag
   */
  tag: IAudioTag<T>
  /**
   * audio property
   */
  property: IAudioProperty
  /**
   * audio quality literal
   */
  quality: AudioQualityType
  /**
   * picture list
   */
  pictures: IParsedPicture[]
  /**
   * reasons that file metadata is not writable
   */
  unwritableReason: string[]
}

function parseQualityType(
  lossless: boolean,
  bitsDepth: number,
  sampleRate: number,
): AudioQualityType {
  if (!lossless) {
    return 'HQ'
  } else if (sampleRate >= 44100 && bitsDepth > 16) {
    return 'Hi-Res'
  } else {
    return 'SQ'
  }
}

type ArrayableName = Exclude<
  {
    [K in keyof IAudioTag]: IAudioTag[K] extends string[] | undefined ? K : never
  }[keyof IAudioTag],
  undefined
>

export type TransformStringArrayFn<T extends string | string[]> = (rawArray: string[], name: ArrayableName) => T

/**
 * parse file metadata to {@link Metadata}
 * @param file {@link File} instance
 * @param transformStringArray transform artists, genres, etc...
 */
export function parseMetadata<T extends string | string[] = string[]>(
  file: File,
  transformStringArray?: TransformStringArrayFn<T>,
): Metadata<T> {
  const tag: Record<string, any> = {}
  for (const [outputName, propName] of Object.entries(AudioTagMap)) {
    const value = file.tag[propName]

    // make sure all array is not empty, else return undefined
    tag[outputName] = Array.isArray(value)
      ? value.length
        // parse string[] if is defined
        ? transformStringArray
          ? transformStringArray(value, outputName as ArrayableName)
          : value
        : undefined
      // else return original value
      : value
  }
  const pictures = file.tag.pictures
    .filter(pic => pic.type !== PictureType.NotAPicture)
    .map(picture => ({
      data: picture.data.toByteArray(),
      description: picture.description,
      filename: picture.filename,
      mimeType: picture.mimeType,
      coverType: picture.type,
    } satisfies IParsedPicture))

  // cannot destructure because they are getters in class instead of real properties
  const props = file.properties
  const property: IAudioProperty = {
    bitRate: ~~props.audioBitrate,
    bitDepth: props.bitsPerSample,
    channels: props.audioChannels,
    duration: ~~props.durationMilliseconds,
    sampleRate: props.audioSampleRate,
    codecs: props.codecs.filter(Boolean).map(c => c.description),
  }

  if (property.bitRate === 0) {
    property.bitRate = ~~((file.fileAbstraction.size - (file.tag.sizeOnDisk || 0)) * 8 / property.duration)
  }

  const quality = parseQualityType(
    props.mediaTypes === MediaTypes.LosslessAudio,
    props.bitsPerSample,
    props.audioSampleRate,
  )

  return {
    tag,
    property,
    quality,
    pictures,
    unwritableReason: file.corruptionReasons,
  }
}

export type UpdateTagKey = keyof IAudioTag

export type UpdateTagValue<T extends UpdateTagKey> = Exclude<IAudioTag[T], undefined>

/**
 * update tag value and will not flush to file
 * @param file {@link File} instance
 * @param key tag key
 * @param value tag value
 */
export function updateTag<T extends UpdateTagKey>(
  file: File,
  key: T,
  value: UpdateTagValue<T>,
): void {
  file.tag[AudioTagMap[key]] = value as any
}

/**
 * update picture value and will not flush to file
 * @param file {@link File} instance
 * @param buffer picture buffer
 * @param fileName picture name with extension
 */
export function updatePicture(
  file: File,
  buffer: Uint8Array | Buffer | number[],
  fileName?: string,
): boolean {
  const pic = fileName
    ? Picture.fromBuffer(fileName, buffer)
    : Picture.fromData(ByteVector.fromByteArray(buffer))
  if (pic.type === PictureType.NotAPicture) {
    return false
  }
  file.tag.pictures = [pic]
  return true
}

/**
 * `Matroska / WebM` use `crypto.getRandomValues` when polyfill for browser,
 * check if support in Web Worker
 */
export async function checkWebWorkerSupport(): Promise<boolean> {
  const inner = (): boolean => !!globalThis.crypto.getRandomValues
  if ('importScripts' in globalThis) {
    return inner()
  }
  try {
    const url = URL.createObjectURL(new Blob([`postMessage((${inner})())`]))
    const worker = new Worker(url)

    const result = await new Promise<boolean>((resolve) => {
      worker.onmessage = ({ data }) => {
        resolve(data)
      }
      worker.onerror = (err) => {
        err.preventDefault()
        resolve(false)
      }
    })
    worker.terminate()
    URL.revokeObjectURL(url)
    return result
  } catch {
    return false
  }
}

/**
 * create new {@link File} from buffer
 * @param fileName file name that includes extension
 * @param buffer buffer
 */
export function getFileFromBuffer(fileName: string, buffer: Uint8Array | Buffer | number[]): File {
  return File.createFromBuffer(fileName, buffer)
}

/**
 * create new {@link File} from path
 * @param filePath file path
 */
export function getFileFromPath(filePath: string): File {
  return File.createFromPath(filePath)
}

/**
 * get current file buffer, return `undefined` if abstraction is not {@link MemoryFileAbstraction}
 * @param file file
 */
export function getBufferFromFile(file: File): Uint8Array | undefined {
  const abstraction = file.fileAbstraction
  return abstraction instanceof MemoryFileAbstraction
    ? abstraction.currentBuffer
    : undefined
}

export class CorruptError extends Error {
  constructor(
    public reasons: string[],
  ) {
    super(`fail to flush file, ${reasons}`)
  }
}

/**
 * flush file instance, auto handle memory file
 * @param file {@link File} instance
 * @throws if `file` is created from buffer and corrupt after flusing, throw {@link CorruptError}
 */
export function flushFile(file: File): File {
  file.save()
  const abstraction = file.fileAbstraction
  if (!(abstraction instanceof MemoryFileAbstraction)) {
    return file
  }
  const result = getFileFromBuffer(abstraction.name, abstraction.currentBuffer)
  if (!result.isWritable) {
    throw new CorruptError(result.corruptionReasons)
  }
  return result
}

/**
 * convert {@link IParsedPicture} to URL with cleanup function
 * @param picture parsed picture
 */
export function getPictureURL(picture: IParsedPicture): [url: string, clean: VoidFunction] {
  const url = URL.createObjectURL(
    new Blob([picture.data], { type: picture.mimeType }),
  )
  return [url, () => URL.revokeObjectURL(url)]
}

type MimeType = string
type Base64String = string

/**
 * convert {@link IParsedPicture} to Base64
 * @param picture parsed picture
 */
export async function getPictureBase64(
  picture: IParsedPicture,
): Promise<`data:${MimeType};base64,${Base64String}`> {
  let reader = new FileReader()
  let promise = new Promise<string>(
    resolve => reader.onload = () => resolve(reader.result as string),
  )
  let type = 'application/octet-stream'
  let blob = new Blob([picture.data], { type })
  reader.readAsDataURL(blob)
  return (await promise).replace(type, picture.mimeType) as any
}
