import { cpSync, rmSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
// eslint-disable-next-line antfu/no-import-dist
import { flushFile, getFileFromPath, updateTag } from '../dist/utils'

const targetPath = './samples/bug_test.m4a'
describe('test', () => {
  beforeEach(() => {
    cpSync('./samples/bug.m4a', targetPath)
  })
  afterEach(() => {
    rmSync(targetPath)
  })
  it('asd', () => {
    const file = getFileFromPath(targetPath)
    updateTag(file, 'title', 'asd')
    expect(file.corruptionReasons).toStrictEqual([])
    flushFile(file)
    expect(getFileFromPath(targetPath).corruptionReasons).toStrictEqual([])
  })
})
