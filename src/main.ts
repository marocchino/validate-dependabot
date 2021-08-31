import * as core from '@actions/core'
import fetch from 'node-fetch'
import {readFileSync} from 'fs'

async function run(): Promise<void> {
  try {
    const path: string = core.getInput('path')
    const successMessage: string = core.getInput('success_message')
    const failureMessage: string = core.getInput('failure_message')
    const {raw, message} = await validate(path, successMessage, failureMessage)
    core.setOutput('raw', raw)
    core.setOutput('markdown', message)
    if (raw.errors.length !== 0) {
      core.setFailed(message)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

export async function validate(
  path: string,
  successMessage: string,
  failureMessage: string
): Promise<{
  raw: {
    errors: {title: string; detail: string; source?: {pointer: string}}[]
  }
  message: string
}> {
  core.debug(`validate against ${path}...`)
  const yaml = readFileSync(path, 'utf-8')
  const result = await fetch(
    'https://api.dependabot.com/config_files/validate',
    {
      method: 'POST',
      headers: {
        Host: 'api.dependabot.com',
        Referer: 'https://dependabot.com/docs/config-file/validator/',
        'Content-Type': 'application/json',
        Origin: 'https://dependabot.com',
        Connection: 'keep-alive'
      },
      body: JSON.stringify({'config-file-body': yaml})
    }
  )
  const raw = await result.json()
  core.debug(`response: ${JSON.stringify(raw)}`)
  let message
  if (raw?.errors.length > 0) {
    const lines = raw.errors
      .map(
        ({
          title,
          detail,
          source
        }: {
          title: string
          detail: string
          source?: {pointer: string}
        }) => `| ${title} | ${detail} | ${source?.pointer} |`
      )
      .join('\n')
    message = `
${failureMessage}

| title | detail | source |
| ----- | ------ | ------ |
${lines}
`
  } else {
    message = successMessage
  }
  return {raw, message}
}

run()
