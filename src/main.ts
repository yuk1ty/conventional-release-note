import * as core from '@actions/core'
import {assert} from 'console'

async function run(): Promise<void> {
  try {
    const commit_log = core.getInput('commit_log')
    const style = core.getInput('style')
    const scopes = core.getMultilineInput('scopes')

    console.log(commit_log)
    console.log(style)
    console.log(scopes.toString())
    // core.debug(commit_log)
    // core.debug(style)
    // core.debug(scopes.toString())

    assert(commit_log === 'feat: add new module!')
    assert(style === 'angular')
    assert(scopes.toString() === '(empty)')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
