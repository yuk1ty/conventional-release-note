import {execute, getTagPatternInput} from './utils'

export const getPreviousTag = () =>
  execute(`git tag --sort=-creatordate ${getTagPatternInput()} | sed -n 2p`)

export const getLogs = (tagRange: string) =>
  execute(`git log --oneline --pretty=tformat:"%s by @%an in %h" ${tagRange}`)
