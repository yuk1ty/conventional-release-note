import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec'
import * as Option from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'

export const execute = (command: string): TE.TaskEither<Error, string> => {
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
  return TE.of(output)
}

export const liftStringToOption = (source: string) => {
  if (source === '') {
    return Option.none
  } else {
    return Option.some(source)
  }
}

export const getTagPatternInput = () => {
  const tagPattern = liftStringToOption(core.getInput('tagPattern'))
  Option.fold(
    () => '',
    s => `--list '${tagPattern}'`
  )(tagPattern)
}

export const makeTagRange = (
  newTag: Option.Option<string>,
  preTag: Option.Option<string>
): TE.TaskEither<Error, string> => {
  if (Option.isNone(newTag) && Option.isNone(preTag)) {
    return TE.left(new Error('ref or preTag should be filled'))
  }
  if (Option.isSome(newTag)) {
    if (Option.isSome(preTag)) {
      return TE.right(`${preTag.value.trim()}...${newTag.value}`)
    } else {
      return TE.right(newTag.value)
    }
  } else {
    return TE.left(new Error('ref should be filled'))
  }
}
