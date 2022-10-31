import * as core from '@actions/core'

import * as Either from 'fp-ts/Either'
import * as Option from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'

import {categorize, stringToConventionalKind} from './classifier'
import {generateDoc, generateReleaseNote} from './generator'
import {getLogsCommand, getPreviousTagsCommand} from './git'
import {execute, liftStringToOption, makeTagRange, second} from './utils'

async function run(): Promise<void> {
  const program: TE.TaskEither<Error, string> = pipe(
    TE.Do,
    TE.bind('preTag', () => {
      const passedPrevTag = liftStringToOption(core.getInput('previous-tag'))
      if (Option.isSome(passedPrevTag)) {
        return TE.right(passedPrevTag.value)
      } else {
        return pipe(
          TE.Do,
          TE.bind('tags', () =>
            execute(getPreviousTagsCommand(core.getInput('tag-pattern')))
          ),
          TE.map(({tags}) => tags.split('\n')),
          TE.bindTo('splitted'),
          TE.map(({splitted}) => second(splitted))
        )
      }
    }),
    TE.chain(({preTag}) =>
      TE.fromEither(
        makeTagRange(
          liftStringToOption(core.getInput('current-tag')),
          liftStringToOption(preTag)
        )
      )
    ),
    TE.bindTo('tagRange'),
    TE.chain(({tagRange}) => execute(getLogsCommand(tagRange))),
    TE.bindTo('commitLog'),
    TE.bind('kind', () =>
      TE.fromEither(stringToConventionalKind(core.getInput('kind')))
    ),
    TE.bind('scopes', () => TE.of(Option.of(core.getMultilineInput('scopes')))),
    TE.chain(({commitLog, kind, scopes}) =>
      categorize(
        commitLog.split('\n'),
        kind,
        Option.filter((s: string[]) => s.length !== 0)(scopes)
      )
    ),
    TE.bindTo('summary'),
    TE.chain(({summary}) => generateDoc(summary)),
    TE.bindTo('docs'),
    TE.chain(({docs}) => generateReleaseNote(docs))
  )
  Either.match(
    err => {
      if (err instanceof Error) {
        core.setFailed(err.message)
      }
    },
    val => {
      core.setOutput('summary', val)
    }
  )(await program())
}

run()
