import * as core from '@actions/core'
import * as Option from 'fp-ts/Option'
import * as Either from 'fp-ts/Either'
import * as TaskEither from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {categorize} from './classifier'
import {generateDoc, generateReleaseNote} from './generator'

async function run(): Promise<void> {
  const program = pipe(
    TaskEither.Do,
    TaskEither.bind('commit_log', () =>
      TaskEither.of(core.getInput('commit_log'))
    ),
    TaskEither.bind('style', () => TaskEither.of(core.getInput('style'))),
    TaskEither.bind('scopes', () =>
      TaskEither.of(Option.of(core.getMultilineInput('scopes')))
    ),
    TaskEither.chain(({commit_log, style, scopes}) =>
      TaskEither.fromIO(
        categorize(
          commit_log.split('\n'),
          Option.filter((s: string[]) => s.length != 0)(scopes)
        )
      )
    ),
    TaskEither.bindTo('categorized'),
    TaskEither.chain(({categorized}) =>
      TaskEither.fromIO(generateDoc(categorized))
    ),
    TaskEither.bindTo('docs'),
    TaskEither.chain(({docs}) => TaskEither.fromIO(generateReleaseNote(docs)))
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
