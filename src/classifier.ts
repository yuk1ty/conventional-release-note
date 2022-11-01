import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as S from 'fp-ts/string'
import * as TE from 'fp-ts/TaskEither'
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

export type ConventionalScope = {
  scopes: O.Option<string[]>
  includeNonScoped: boolean
}

export const makeConventionScope = (
  scopes: O.Option<string[]>,
  includeNonScoped: boolean
): E.Either<Error, ConventionalScope> => {
  return E.right({
    scopes: O.filter((s: string[]) => s.length !== 0)(scopes),
    includeNonScoped: includeNonScoped
  })
}

const filterLogBy =
  (scope: ConventionalScope, convention: string) => (log: string) => {
    const extracted = O.fromNullable(
      /([a-z]+)\(?([a-z]+)?\)?: [a-z]+/.exec(log)
    )
    const filtered = O.filter((elems: NonNullable<RegExpExecArray>) => {
      const _convention = elems[1]
      const _scope: O.Option<string> = O.fromNullable(elems[2])

      if (scope.includeNonScoped) {
        return S.Eq.equals(convention, _convention)
      } else {
        if (O.isSome(scope.scopes) && O.isSome(_scope)) {
          return (
            scope.scopes.value.findIndex(s => S.Eq.equals(s, _scope.value)) !==
              -1 && S.Eq.equals(convention, _convention)
          )
        } else if (O.isNone(scope.scopes) && O.isNone(_scope)) {
          return S.Eq.equals(convention, _convention)
        } else {
          return false
        }
      }
    })(extracted)
    return O.isSome(filtered)
  }

export const categorize = (
  logs: string[],
  kind: ConventionalKind,
  scope: ConventionalScope
): TE.TaskEither<Error, CategorizedSummary> => {
  if (kind === 'default') {
    return pipe(
      TE.Do,
      TE.bind('feat', () => TE.of(logs.filter(filterLogBy(scope, 'feat')))),
      TE.bind('fix', () => TE.of(logs.filter(filterLogBy(scope, 'fix')))),
      TE.chain(({feat, fix}) =>
        TE.right({
          feat,
          fix
        })
      )
    )
  } else {
    return TE.left(new Error('cannot accept a value except "default"'))
  }
}
