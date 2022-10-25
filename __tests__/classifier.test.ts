import {none, some} from 'fp-ts/Option'
import * as IO from 'fp-ts/IO'
import {pipe} from 'fp-ts/lib/function'
import {expect, test, describe} from '@jest/globals'
import {categorize} from '../src/classifier'

describe('categorize function', () => {
  test('categorize commits from "feat" and "fix" without scope', () => {
    const logs = [
      'feat: add a new feature',
      'fix: fix a bug',
      'feat: add another feature'
    ]
    const runTest = pipe(
      IO.Do,
      IO.bind('result', () => categorize(logs, none)),
      IO.chain(({result}) =>
        IO.of(
          expect(result).toStrictEqual({
            feat: ['feat: add a new feature', 'feat: add another feature'],
            fix: ['fix: fix a bug']
          })
        )
      )
    )
    runTest()
  })

  test('categorize commits with specific scope', () => {
    const logs = [
      'feat(data): add a new feature',
      'fix(data): fix a bug',
      'feat(other): add another feature'
    ]

    const runTest = pipe(
      IO.Do,
      IO.bind('result', () => categorize(logs, some('data'))),
      IO.chain(({result}) =>
        IO.of(
          expect(result).toStrictEqual({
            feat: ['feat(data): add a new feature'],
            fix: ['fix(data): fix a bug']
          })
        )
      )
    )
    runTest()
  })
})
