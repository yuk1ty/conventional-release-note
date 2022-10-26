import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec'
import * as Option from 'fp-ts/Option'
import * as Either from 'fp-ts/Either'
import * as TaskEither from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {categorize} from './classifier'
import {generateDoc, generateReleaseNote} from './generator'

const execute = (command: string) => {
  let output = ''
  const options: ExecOptions = {}
  options.listeners = {
    stdout: (data: Buffer) => {
      output += data.toString()
    },
    stderr: (data: Buffer) => {
      console.error(data)
    }
  }
  Promise.resolve(exec.exec(command, [], options))
  return TaskEither.of(output)
}

async function run(): Promise<void> {
  const program = pipe(
    TaskEither.Do,
    TaskEither.bind('newTag', () => TaskEither.of(core.getInput('ref'))),
    TaskEither.bind('preTag', () =>
      execute('/bin/bash -c "git tag --sort=-creatordate | sed -n 2p"')
    ),
    TaskEither.chain(({newTag, preTag}) =>
      execute(
        `git log --oneline --pretty=tformat:"%s by %an in %h" ${preTag.trim()}..${newTag}`
      )
    ),
    TaskEither.bindTo('commitLog'),
    TaskEither.bind('commit_log', () =>
      TaskEither.of(core.getInput('commit_log'))
    ),
    // TODO now can accept only "angular"
    TaskEither.bind('style', () => TaskEither.of(core.getInput('style'))),
    TaskEither.bind('scopes', () =>
      TaskEither.of(Option.of(core.getMultilineInput('scopes')))
    ),
    TaskEither.chain(({commitLog, style, scopes}) =>
      TaskEither.fromIO(
        categorize(
          commitLog.split('\n'),
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
