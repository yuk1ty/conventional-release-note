import {none, some} from 'fp-ts/Option'
import * as IO from 'fp-ts/IO'
import {expect, test, describe} from '@jest/globals'
import {categorize} from '../src/classifier'

describe('categorize function', () => {
  test('categorize commits from "feat" and "fix" without scope', () => {
    const logs = [
      'feat: add a new feature',
      'fix: fix a bug',
      'feat: add another feature'
    ]
    const result = categorize(logs, none)
    IO.map(elem =>
      expect(elem).toStrictEqual({
        feat: ['feat: add a new feature', 'feat: add another feature'],
        fix: ['fix: fix a bug']
      })
    )(result)
  })

  test('categorize commits with specific scope', () => {
    const logs = [
      'feat(data): add a new feature',
      'fix(data): fix a bug',
      'feat(other): add another feature'
    ]
    const result = categorize(logs, some('data'))
    IO.map(elem =>
      expect(elem).toStrictEqual({
        feat: ['feat(data): add a new feature'],
        fix: ['fix(data): fix a bug']
      })
    )(result)
  })
})
