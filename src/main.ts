import * as core from '@actions/core'
import Ajv, {ErrorObject} from 'ajv'
import YAML from 'yaml'
import fetch from 'node-fetch'
import {readFileSync} from 'fs'
import https from 'https' // <--- add this

async function run(): Promise<void> {
  try {
    const path: string = core.getInput('path')
    const successMessage: string = core.getInput('success_message')
    const failureMessage: string = core.getInput('failure_message')
    const {errors, message} = await validateDependabot(
      path,
      successMessage,
      failureMessage
    )
    core.setOutput('errors', errors)
    core.setOutput('markdown', message)
    if (errors) {
      core.setFailed(message)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

export async function validateDependabot(
  path: string,
  successMessage: string,
  failureMessage: string
): Promise<{
  errors?: ErrorObject[] | null | undefined
  message: string
}> {
  const ajv = new Ajv({extendRefs: true, allErrors: true})
  core.debug(`validate against ${path}...`)

  // load target file
  const yaml = readFileSync(path, 'utf-8')
  const json = YAML.parse(yaml)

  // load schema
  const agent =
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0'
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined

  const response = await fetch(
    'https://json.schemastore.org/dependabot-2.0.json',
    { agent }
  )

  const schema = (await response.json()) as object

  // validate
  const validate = ajv.compile(schema)
  const valid = await validate(json)

  if (valid) {
    return {message: successMessage}
  }
  core.debug(`errors: ${JSON.stringify(validate.errors)}`)
  const lines = (validate?.errors ?? [])
    .map(
      ({keyword, message, dataPath}: ErrorObject) =>
        `| ${keyword} | ${message} | ${dataPath} |`
    )
    .join('\n')
  const message = `
${failureMessage}

| keyword | message | dataPath |
| ------- | ------- | -------- |
${lines}
`
  return {errors: validate.errors, message}
}

run()
