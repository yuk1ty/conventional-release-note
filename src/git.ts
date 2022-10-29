import {getTagPatternInput} from './utils'

export const getPreviousTags = (tagPattern: string): string =>
  `git tag --sort=-creatordate ${getTagPatternInput(tagPattern)}`

export const getLogs = (tagRange: string): [string, string[]] => [
  'git log',
  ['--oneline', '--pretty=tformat:"%s by @%an in %h"', tagRange]
]
