import {getTagPatternInput} from './utils'

export const getPreviousTagsCommand = (tagPattern: string): string =>
  `git tag --sort=-creatordate ${getTagPatternInput(tagPattern)}`

export const getLogsCommand = (tagRange: string): string =>
  `git log --oneline --pretty=tformat:\"%s by @%an in %h\" ${tagRange}`
