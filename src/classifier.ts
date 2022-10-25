import {Option, fromNullable, filter, isSome, getEq} from 'fp-ts/Option'
import * as IO from 'fp-ts/IO'
import * as S from 'fp-ts/string'
import {pipe} from 'fp-ts/lib/function'

export type CategorizedSummary = {
  feat: string[]
  fix: string[]
}

const E = getEq(S.Eq)

const filterLogBy =
  (scope: Option<string>, convention: string) => (log: string) => {
    const m = fromNullable(/([a-z]+)\(?([a-z]+)?\)?: [a-z]+/.exec(log))
    const filtered = filter((m: NonNullable<RegExpExecArray>) => {
      const _convention = m[1]
      const _scope: Option<string> = fromNullable(m[2])
      return E.equals(scope, _scope) && convention === _convention
    })(m)
    return isSome(filtered)
  }

export const categorize = (logs: string[], scope: Option<string>) => {
  return pipe(
    IO.Do,
    IO.chain(() => IO.of(console.log(logs))),
    IO.chain(() => IO.of(console.log(scope))),
    IO.bind('feat', () => IO.of(logs.filter(filterLogBy(scope, 'feat')))),
    IO.bind('fix', () => IO.of(logs.filter(filterLogBy(scope, 'fix')))),
    IO.chain(({feat, fix}) =>
      IO.of({
        feat: feat,
        fix: fix
      })
    )
  )
}
