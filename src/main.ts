import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const commit_log = core.getInput('commit_log')
    const style = core.getInput('style')
    const scopes = core.getMultilineInput('scopes')

    core.debug(commit_log)
    core.debug(style)
    core.debug(scopes.toString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
