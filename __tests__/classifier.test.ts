import {none, some} from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {expect, test, describe} from '@jest/globals'
import {categorize} from '../src/classifier'

describe('categorize function', () => {
  test('categorize commits from "feat" and "fix" without scope', async () => {
    const logs = [
      'feat: add a new feature',
      'fix: fix a bug',
      'feat: add another feature'
    ]

    const runTest = pipe(
      TE.Do,
      TE.bind('result', () => categorize(logs, none)),
      TE.chain(({result}) =>
        TE.of(
          expect(result).toStrictEqual({
            feat: ['feat: add a new feature', 'feat: add another feature'],
            fix: ['fix: fix a bug']
          })
        )
      )
    )

    await runTest()
  })

  test('categorize commits with specific scope', async () => {
    const logs = [
      'feat(data): add a new feature',
      'fix(data): fix a bug',
      'feat(other): add another feature'
    ]

    const runTest = pipe(
      TE.Do,
      TE.bind('result', () => categorize(logs, some(['data']))),
      TE.chain(({result}) =>
        TE.of(
          expect(result).toStrictEqual({
            feat: ['feat(data): add a new feature'],
            fix: ['fix(data): fix a bug']
          })
        )
      )
    )
    await runTest()
  })

  test('categorize commits with multiple scopes', async () => {
    const logs = [
      'feat(data): add a new feature',
      'fix(data): fix a bug',
      'feat(other): add another feature',
      'fix(another): not include this'
    ]

    const runTest = pipe(
      TE.Do,
      TE.bind('result', () => categorize(logs, some(['data', 'other']))),
      TE.chain(({result}) =>
        TE.of(
          expect(result).toStrictEqual({
            feat: [
              'feat(data): add a new feature',
              'feat(other): add another feature'
            ],
            fix: ['fix(data): fix a bug']
          })
        )
      )
    )
    await runTest()
  })
})
