import { cpSync, rmSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createFileFromPath, flushFile, updateTag } from '../dist/index.js'

const targetPath = './samples/bug_test.m4a'
describe('test', () => {
  beforeEach(() => {
    cpSync('./samples/bug.m4a', targetPath)
  })
  afterEach(() => {
    rmSync(targetPath)
  })
  it('asd', () => {
    const file = createFileFromPath(targetPath)
    updateTag(file, 'title', 'asd')
    expect(file.corruptionReasons).toStrictEqual([])
    flushFile(file)
    expect(createFileFromPath(targetPath).corruptionReasons).toStrictEqual([])
  })
})
