import {describe, expect, test} from '@jest/globals'

import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {none, some} from 'fp-ts/Option'

import {
  categorize,
  makeConventionScope,
  stringToConventionalKind
} from '../src/classifier'

describe('stringToConventionalKind function', () => {
  test("raises error if the passed value wasn't contained", () => {
    // For example, the empty string is not contained in `acceptableKinds`
    const result = stringToConventionalKind('')
    expect(E.isLeft(result)).toBe(true)
  })
})

describe('categorize function', () => {
  test('categorizes commits from "feat" and "fix" without scope', async () => {
    const logs = [
      'feat: add a new feature',
      'fix: fix a bug',
      'feat: add another feature'
    ]

    const runTest = pipe(
      TE.Do,
      TE.bind('result', () =>
        categorize(logs, 'default', {scopes: none, includeNonScoped: false})
      ),
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

  test('categorizes commits with specific scope', async () => {
    const logs = [
      'feat(data): add a new feature',
      'fix(data): fix a bug',
      'feat(other): add another feature'
    ]

    const runTest = pipe(
      TE.Do,
      TE.bind('result', () =>
        categorize(logs, 'default', {
          scopes: some(['data']),
          includeNonScoped: false
        })
      ),
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

  test('categorizes commits with multiple scopes', async () => {
    const logs = [
      'feat(data): add a new feature',
      'fix(data): fix a bug',
      'feat(other): add another feature',
      'fix(another): not include this'
    ]

    const runTest = pipe(
      TE.Do,
      TE.bind('result', () =>
        categorize(logs, 'default', {
          scopes: some(['data', 'other']),
          includeNonScoped: false
        })
      ),
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

  test('categorizes commits with specific scope and including non scoped', async () => {
    const logs = [
      'feat(data): add a new feature',
      'fix(data): fix a bug',
      'feat: add another feature'
    ]

    const runTest = pipe(
      TE.Do,
      TE.bind('result', () =>
        categorize(logs, 'default', {
          scopes: some(['data']),
          includeNonScoped: true
        })
      ),
      TE.chain(({result}) =>
        TE.of(
          expect(result).toStrictEqual({
            feat: [
              'feat(data): add a new feature',
              'feat: add another feature'
            ],
            fix: ['fix(data): fix a bug']
          })
        )
      )
    )
    await runTest()
  })
})
