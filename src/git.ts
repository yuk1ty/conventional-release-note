import {getTagPatternInput} from './utils'

export const getPreviousTag = (tagPattern: string) =>
  `git tag --sort=-creatordate ${getTagPatternInput(tagPattern)}`.split('\n')[1]

export const getLogs = (tagRange: string) =>
  `git log --oneline --pretty=tformat:\"%s by @%an in %h\" ${tagRange}`
