import { cpSync, readFileSync, rmSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createFileFromBuffer, createFileFromPath, createPicturefromPath, type Tag } from '../dist/index.js'
import { flushFile, createFileFromBuffer as getFileFromBuffer, parseMetadata } from '../dist/index.js'

describe('test suit', () => {
  const dict = {
    title: 'Victory',
    performers: ['Two Steps From Hell'],
    album: 'BattleCry',
    comment: 'test comment',
    disc: 1,
    discCount: 0,
    genres: ['Classical'],
    composers: ['Two Steps From Hell (Composer)'],
    albumArtists: ['Two Steps From Hell (Album Artist)'],
    lyrics: 'test lyrics',
    track: 3,
    trackCount: 0,
    year: 2016,
  } as const
  ['mp3', 'm4a', 'flac', 'opus', 'wav'].forEach((str) => {
    it(str, () => {
      const fileName = `test.${str}`
      const file = getFileFromBuffer(fileName, readFileSync(`./samples/${fileName}`))
      for (const [prop, value] of Object.entries(dict)) {
        expect(file.tag[prop as keyof Tag]).toStrictEqual(value)
      }
      const { property } = parseMetadata(file, undefined)
      console.log(`${property.bitRate} kbps`)
      console.log(`${property.sampleRate} Hz`)
      console.log(`${property.bitDepth} bit`)
      console.log(`${property.channels} Channels`)
      console.log(`${property.duration} ms`)
      console.log(`${property.codecs}`)
      file.tag.album = 'test album'
      file.tag.pictures = [createPicturefromPath('./samples/cover.jpg')]
      file.save()
    })
  })
  it('large file (fs)', () => {
    const source = `./samples/1111.mp3`
    const target = `./samples/temp.mp3`
    cpSync(source, target)
    const file = createFileFromPath(target)
    file.tag.album = 'test album'
    file.tag.pictures = [createPicturefromPath('./samples/cover.jpg')]
    file.save()
    rmSync(target)
  })
  it('large file (memory)', () => {
    const fileName = `1111.mp3`
    let file = createFileFromBuffer(fileName, readFileSync(`./samples/${fileName}`))
    file.tag.album = 'test album'
    file.tag.pictures = [createPicturefromPath('./samples/cover.jpg')]
    file.tag.genres = ['test:111']
    file = flushFile(file)
    console.log(file.properties.codecs[0].description)
  })
})
