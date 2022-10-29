import {getTagPatternInput} from './utils'

export const getPreviousTag = (tagPattern: string): string => {
  const output = `git tag --sort=-creatordate ${getTagPatternInput(
    tagPattern
  )}`.split('\n')
  if (output.length === 1) {
    return output[0]
  } else {
    return output[1]
  }
}

export const getLogs = (tagRange: string): string =>
  `git log --oneline --pretty=tformat:\"%s by @%an in %h\" ${tagRange}`
