import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {expect, test, describe} from '@jest/globals'
import {generateDoc, generateReleaseNote} from '../src/generator'

describe('generateDoc function', () => {
  test('returns specific Doc array', async () => {
    const summary = {
      feat: ['feat: add a new feature', 'feat: add another feature'],
      fix: ['fix a bug']
    }

    const runTest = pipe(
      TE.Do,
      TE.bind('result', () => generateDoc(summary)),
      TE.chain(({result}) =>
        TE.of(
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
    await runTest()
  })
})

describe('generateReleaseNote function', () => {
  test('returns specific Release Note', async () => {
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
      TE.Do,
      TE.bind('result', () => generateReleaseNote(docs)),
      TE.chainFirst(({result}) =>
        TE.of(
          expect(result).toMatch(`## Features
* feat: add a new feature
* feat: add another feature
## Bug Fixes
* fix a bug`)
        )
      )
    )
    await runTest()
  })

  test('only returns Release Note including features', async () => {
    const docs = [
      {
        title: 'Features',
        content: '* feat: add a new feature\n* feat: add another feature'
      }
    ]
    const runTest = pipe(
      TE.Do,
      TE.bind('result', () => generateReleaseNote(docs)),
      TE.chainFirst(({result}) =>
        TE.of(
          expect(result).toMatch(`## Features
* feat: add a new feature
* feat: add another feature`)
        )
      )
    )
    await runTest()
  })

  test('returns Release Note with no content', async () => {
    const runTest = pipe(
      TE.Do,
      TE.bind('result', () => generateReleaseNote([])),
      TE.chainFirst(({result}) => TE.of(expect(result).toStrictEqual('')))
    )
    await runTest()
  })
})
