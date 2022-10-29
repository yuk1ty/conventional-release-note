import * as exec from '@actions/exec'

import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'

export const execute = (
  command: string,
  args?: string[]
): TE.TaskEither<Error, string> => {
  return TE.tryCatch(
    async () => innerExec(command, args),
    err => {
      if (err instanceof Error) {
        return new Error(err.message)
      } else {
        // not comes here?
        return new Error('unexpected error occurred')
      }
    }
  )
}

const innerExec = async (command: string, args?: string[]): Promise<string> => {
  const output = await exec.getExecOutput(command, args)
  if (output.exitCode === 0) {
    return output.stdout
  } else {
    throw new Error(output.stderr)
  }
}

export const liftStringToOption = (source: string): O.Option<string> => {
  if (source === '') {
    return O.none
  } else {
    return O.some(source)
  }
}

export const getTagPatternInput = (tagPattern: string): string => {
  const pat = liftStringToOption(tagPattern)
  return O.fold(
    () => '',
    p => `--list "${p}"`
  )(pat)
}

export const makeTagRange = (
  newTag: O.Option<string>,
  preTag: O.Option<string>
): E.Either<Error, string> => {
  if (O.isNone(newTag) && O.isNone(preTag)) {
    return E.left(new Error('ref or preTag should be filled'))
  }
  if (O.isSome(newTag)) {
    if (O.isSome(preTag)) {
      return E.right(`${preTag.value.trim()}...${newTag.value}`)
    } else {
      return E.right(newTag.value)
    }
  } else {
    return E.left(new Error('ref should be filled'))
  }
}

export const second = (array: string[]): string => {
  if (array.length === 0) {
    return array[0]
  } else {
    return array[1]
  }
}
