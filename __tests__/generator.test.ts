import * as IO from 'fp-ts/IO'
import {pipe} from 'fp-ts/lib/function'
import {expect, test, describe} from '@jest/globals'
import {generateDoc, generateReleaseNote} from '../src/generator'

describe('generateDoc function', () => {
  test('returns specific Doc array', () => {
    const summary = {
      feat: ['feat: add a new feature', 'feat: add another feature'],
      fix: ['fix a bug']
    }

    const runTest = pipe(
      IO.Do,
      IO.bind('result', () => generateDoc(summary)),
      IO.chain(({result}) =>
        IO.of(
          expect(result).toStrictEqual([
            {
              title: 'Features',
              content: '* feat: add a new feature\n* feat: add another feature'
            },
            {
              title: 'Bug Fixes',
              content: '* fix a bug'
            }
          ])
        )
      )
    )
    runTest()
  })
})

describe('generateReleaseNote function', () => {
  test('returns specific Release Note', () => {
    const docs = [
      {
        title: 'Features',
        content: '* feat: add a new feature\n* feat: add another feature'
      },
      {
        title: 'Bug Fixes',
        content: '* fix a bug\n'
      }
    ]
    const runTest = pipe(
      IO.Do,
      IO.bind('result', () => generateReleaseNote(docs)),
      IO.chainFirst(({result}) =>
        IO.of(
          expect(result).toMatch(`## Features
* feat: add a new feature
* feat: add another feature## Bug Fixes
* fix a bug`)
        )
      )
    )
    runTest()
  })
})
