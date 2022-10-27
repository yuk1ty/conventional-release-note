import * as core from '@actions/core'
import * as Option from 'fp-ts/Option'
import * as Either from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {categorize} from './classifier'
import {generateDoc, generateReleaseNote} from './generator'
import {execute, liftStringToOption, makeTagRange} from './utils'
import {getPreviousTag, getLogs} from './git'

async function run(): Promise<void> {
  const program: TE.TaskEither<Error, string> = pipe(
    TE.Do,
    TE.bind('preTag', () =>
      execute(getPreviousTag(core.getInput('tagPattern')))
    ),
    TE.chain(({preTag}) =>
      TE.fromEither(
        makeTagRange(
          liftStringToOption(core.getInput('currentTag')),
          liftStringToOption(preTag)
        )
      )
    ),
    TE.bindTo('tagRange'),
    TE.chain(({tagRange}) => execute(getLogs(tagRange))),
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
      console.log('%j', val)
      core.setOutput('summary', val)
    }
  )(await program())
}

run()
