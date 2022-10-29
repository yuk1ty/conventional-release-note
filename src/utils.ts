import * as exec from '@actions/exec'
import * as Option from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

export const execute = (
  command: string,
  args?: string[]
): TE.TaskEither<Error, string> => {
  return TE.tryCatch(
    () => innerExec(command, args),
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

export const liftStringToOption = (source: string) => {
  if (source === '') {
    return Option.none
  } else {
    return Option.some(source)
  }
}

export const getTagPatternInput = (tagPattern: string) => {
  const pat = liftStringToOption(tagPattern)
  return Option.fold(
    () => '',
    pat => `--list "${pat}"`
  )(pat)
}

export const makeTagRange = (
  newTag: Option.Option<string>,
  preTag: Option.Option<string>
): E.Either<Error, string> => {
  console.log('newTag: %j', newTag)
  console.log('prevTag: %j', preTag)
  if (Option.isNone(newTag) && Option.isNone(preTag)) {
    return E.left(new Error('ref or preTag should be filled'))
  }
  if (Option.isSome(newTag)) {
    if (Option.isSome(preTag)) {
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
