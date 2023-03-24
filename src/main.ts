import * as core from '@actions/core'
import Ajv, {ErrorObject} from 'ajv'
import YAML from 'yaml'
import fetch from 'node-fetch'
import {readFileSync} from 'fs'

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
  errors?: ErrorObject[] | undefined
  message: string
}> {
  const ajv = new Ajv({extendRefs: true})
  core.debug(`validate against ${path}...`)

  // load target file
  const yaml = readFileSync(path, 'utf-8')
  const json = YAML.parse(yaml)

  // load schema
  const response = await fetch(
    'https://json.schemastore.org/dependabot-2.0.json'
  )

  const schema = (await response.json()) as object

  // validate
  const validate = ajv.compile(schema)
  const valid1 = await validate(json)
  const {valid: valid2, errors} = inhouseValidate(json)

  if (valid1 && valid2) {
    return {message: successMessage}
  }
  core.debug(`errors: ${JSON.stringify(validate.errors)}`)
  core.debug(`errors: ${JSON.stringify(errors)}`)
  const lines = [...(validate?.errors ?? []), ...errors]
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

function inhouseValidate(json: object): {
  valid: boolean
  errors: ErrorObject[]
} {
  const result: {valid: boolean; errors: ErrorObject[]} = {
    valid: true,
    errors: []
  }

  for (const [i, update] of (json as any)?.['updates']?.entries() ?? []) {
    if (update['commit-message']?.['prefix']?.length > 50) {
      const error: ErrorObject = {
        keyword: 'invalid',
        message: 'commit-message.prefix require to be less than 50 characters',
        dataPath: `.updates[${i}].commit-message.prefix`,
        schemaPath: '',
        params: ''
      }
      result.errors.push(error)
      result.valid = false
    }
    if (update['commit-message']?.['prefix-development']?.length > 50) {
      const error: ErrorObject = {
        keyword: 'invalid',
        message:
          'commit-message.prefix-development require to be less than 50 characters',
        dataPath: `.updates[${i}].commit-message.prefix-development`,
        schemaPath: '',
        params: ''
      }
      result.errors.push(error)
      result.valid = false
    }
  }
  return result
}
run()
