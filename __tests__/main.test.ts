import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {validateDependabot} from '../src/main'

// shows how the runner will run a javascript action with env / stdout protocol
test.skip('test runs', () => {
  process.env['INPUT_PATH'] = '.github/dependabot.yml'
  process.env['INPUT_SUCCESS_MESSAGE'] = '✅dependabot config looks good 👍'
  process.env['INPUT_FAILURE_MESSAGE'] = '🚫 dependabot errors'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
describe('validateDependabot', () => {
  test('no errors', async () => {
    expect(
      await validateDependabot(
        '.github/dependabot.yml',
        '✅dependabot config looks good 👍',
        '🚫 dependabot errors'
      )
    ).toEqual({
      message: '✅dependabot config looks good 👍'
    })
  })
  test('with errors', async () => {
    expect(
      await validateDependabot(
        '__tests__/dependabot-error.yml',
        '✅dependabot config looks good 👍',
        '🚫 dependabot errors'
      )
    ).toEqual({
      message: `
🚫 dependabot errors

| keyword | message | dataPath |
| ------- | ------- | -------- |
| maxLength | should NOT be longer than 50 characters | .updates[0]['commit-message'].prefix |
| required | should have required property 'schedule' | .updates[0] |
| required | should have required property 'directories' | .updates[0] |
| required | should have required property 'directory' | .updates[0] |
| oneOf | should match exactly one schema in oneOf | .updates[0] |
| maxLength | should NOT be longer than 50 characters | .updates[1]['commit-message']['prefix-development'] |
| required | should have required property 'schedule' | .updates[1] |
| required | should have required property 'directories' | .updates[1] |
| required | should have required property 'directory' | .updates[1] |
| oneOf | should match exactly one schema in oneOf | .updates[1] |
`,
      errors: [
        {
          keyword: 'maxLength',
          dataPath: ".updates[0]['commit-message'].prefix",
          schemaPath: '#/properties/commit-message/properties/prefix/maxLength',
          params: {
            limit: 50
          },
          message: 'should NOT be longer than 50 characters'
        },
        {
          keyword: 'required',
          dataPath: '.updates[0]',
          schemaPath: '#/allOf/0/required',
          params: {
            missingProperty: 'schedule'
          },
          message: "should have required property 'schedule'"
        },
        {
          keyword: 'required',
          dataPath: '.updates[0]',
          schemaPath: '#/allOf/1/oneOf/0/required',
          params: {
            missingProperty: 'directories'
          },
          message: "should have required property 'directories'"
        },
        {
          keyword: 'required',
          dataPath: '.updates[0]',
          schemaPath: '#/allOf/1/oneOf/1/required',
          params: {
            missingProperty: 'directory'
          },
          message: "should have required property 'directory'"
        },
        {
          keyword: 'oneOf',
          dataPath: '.updates[0]',
          schemaPath: '#/allOf/1/oneOf',
          params: {
            passingSchemas: null
          },
          message: 'should match exactly one schema in oneOf'
        },
        {
          keyword: 'maxLength',
          dataPath: ".updates[1]['commit-message']['prefix-development']",
          schemaPath:
            '#/properties/commit-message/properties/prefix-development/maxLength',
          params: {
            limit: 50
          },
          message: 'should NOT be longer than 50 characters'
        },
        {
          keyword: 'required',
          dataPath: '.updates[1]',
          schemaPath: '#/allOf/0/required',
          params: {
            missingProperty: 'schedule'
          },
          message: "should have required property 'schedule'"
        },
        {
          keyword: 'required',
          dataPath: '.updates[1]',
          schemaPath: '#/allOf/1/oneOf/0/required',
          params: {
            missingProperty: 'directories'
          },
          message: "should have required property 'directories'"
        },
        {
          keyword: 'required',
          dataPath: '.updates[1]',
          schemaPath: '#/allOf/1/oneOf/1/required',
          params: {
            missingProperty: 'directory'
          },
          message: "should have required property 'directory'"
        },
        {
          keyword: 'oneOf',
          dataPath: '.updates[1]',
          schemaPath: '#/allOf/1/oneOf',
          params: {
            passingSchemas: null
          },
          message: 'should match exactly one schema in oneOf'
        }
      ]
    })
  })
})
