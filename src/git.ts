import {getTagPatternInput} from './utils'

export const getPreviousTag = (tagPattern: string) =>
  `git tag --sort=-creatordate ${getTagPatternInput(tagPattern)} | sed -n 2p`

export const getLogs = (tagRange: string) =>
  `git log --oneline --pretty=tformat:"%s by @%an in %h" ${tagRange}`
