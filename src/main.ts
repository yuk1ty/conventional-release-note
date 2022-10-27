import * as core from '@actions/core'
import * as Option from 'fp-ts/Option'
import * as Either from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {categorize} from './classifier'
import {generateDoc, generateReleaseNote} from './generator'
import {liftStringToOption, makeTagRange} from './utils'
import {getPreviousTag, getLogs} from './git'

async function run(): Promise<void> {
  const program: TE.TaskEither<Error, string> = pipe(
    TE.Do,
    TE.bind('preTag', () => getPreviousTag()),
    TE.chain(({preTag}) =>
      makeTagRange(
        liftStringToOption(core.getInput('currentTag')),
        liftStringToOption(preTag)
      )
    ),
    TE.chain(getLogs),
    TE.bindTo('commitLog'),
    // TODO now can accept only "angular"
    TE.bind('style', () => TE.of(core.getInput('style'))),
    TE.bind('scopes', () => TE.of(Option.of(core.getMultilineInput('scopes')))),
    TE.chain(({commitLog, style, scopes}) =>
      categorize(
        commitLog.split('\n'),
        Option.filter((s: string[]) => s.length != 0)(scopes)
      )
    ),
    TE.chain(generateDoc),
    TE.chain(generateReleaseNote)
  )
  Either.match(
    err => {
      if (err instanceof Error) {
        core.setFailed(err.message)
      }
    },
    val => core.setOutput('summary', val)
  )(await program())
}

run()
