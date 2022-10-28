import {Option, fromNullable, filter, isSome, isNone} from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as S from 'fp-ts/string'
import {pipe} from 'fp-ts/lib/function'

export type CategorizedSummary = {
  feat: string[]
  fix: string[]
}

export type ConventionalKind = 'default'

const acceptableKinds = ['default']

export const stringToConventionalKind = (
  kind: string
): E.Either<Error, ConventionalKind> => {
  if (acceptableKinds.includes(kind)) {
    if (kind === 'default') {
      return E.right(kind)
    }
  }
  return E.left(new Error(`"kind" should be ${acceptableKinds.join(',')}`))
}

const filterLogBy =
  (scope: Option<string[]>, convention: string) => (log: string) => {
    const m = fromNullable(/([a-z]+)\(?([a-z]+)?\)?: [a-z]+/.exec(log))
    const filtered = filter((m: NonNullable<RegExpExecArray>) => {
      const _convention = m[1]
      const _scope: Option<string> = fromNullable(m[2])

      if (isSome(scope) && isSome(_scope)) {
        return (
          scope.value.findIndex(s => S.Eq.equals(s, _scope.value)) !== -1 &&
          S.Eq.equals(convention, _convention)
        )
      } else if (isNone(scope) && isNone(_scope)) {
        return S.Eq.equals(convention, _convention)
      } else {
        return false
      }
    })(m)
    return isSome(filtered)
  }

export const categorize = (
  logs: string[],
  kind: ConventionalKind,
  scope: Option<string[]>
): TE.TaskEither<Error, CategorizedSummary> => {
  if (kind === 'default') {
    return pipe(
      TE.Do,
      TE.bind('feat', () => TE.of(logs.filter(filterLogBy(scope, 'feat')))),
      TE.bind('fix', () => TE.of(logs.filter(filterLogBy(scope, 'fix')))),
      TE.chain(({feat, fix}) =>
        TE.right({
          feat: feat,
          fix: fix
        })
      )
    )
  } else {
    return TE.left(new Error('cannot accept a value except "default"'))
  }
}
