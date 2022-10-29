import {expect, test, describe} from '@jest/globals'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as util from '../src/utils'

describe('listStringToOption', () => {
  test('returns none if passed string was empty', () => {
    const result = util.liftStringToOption('')
    expect(result).toStrictEqual(O.none)
  })

  test('returns some with the specific string when a string with a value was passed', () => {
    const result = util.liftStringToOption('passed')
    expect(result).toStrictEqual(O.some('passed'))
  })
})

describe('getTagPatternInput', () => {
  test('returns an empty string if empty string was passed', () => {
    const result = util.getTagPatternInput('')
    expect(result).toStrictEqual('')
  })

  test('returns the specific string with the list option when a string with some values was passed', () => {
    const result = util.getTagPatternInput('v*')
    expect(result).toStrictEqual('--list "v*"')
  })
})

describe('makeTagRange', () => {
  test('returns an error when `preTag` and `newTag` were empty', () => {
    const result = util.makeTagRange(O.none, O.none)
    expect(E.isLeft(result)).toBe(true)
  })

  test('returns an error when `newTag` was empty and `preTag` was filled', () => {
    const result = util.makeTagRange(O.none, O.some('v0.1.0'))
    expect(E.isLeft(result)).toBe(true)
  })

  test('returns v0.1.0...v0.1.1', () => {
    const result = util.makeTagRange(O.some('v0.1.1'), O.some('v0.1.0'))
    expect(E.isRight(result)).toBe(true)
    if (E.isRight(result)) {
      expect(result.right).toStrictEqual('v0.1.0...v0.1.1')
    }
  })
})

describe('execute function', () => {
  test('returns right if a command execution finished successfully', async () => {
    const result = util.execute(`pwd`)
    expect(E.isRight(await result())).toBe(true)
  })
})
