import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import fetchMock from 'jest-fetch-mock'
import {validate} from '../src/main'

beforeEach(() => {
  fetchMock.resetMocks()
  jest.resetModules()
})
// shows how the runner will run a javascript action with env / stdout protocol
test.skip('test runs', () => {
  process.env['INPUT_PATH'] = '.github/dependabot.yml'
  process.env['INPUT_SUCCESS_MESSAGE'] = '.github/dependabot.yml'
  process.env['INPUT_FAILURE_MESSAGE'] = '.github/dependabot.yml'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
describe('validate', () => {
  test('no errors', async () => {
    fetchMock.mockOnce(JSON.stringify({errors: []}))
    expect(
      await validate(
        '.github/dependabot.yml',
        '✅dependabot config looks good 👍',
        ''
      )
    ).toEqual({
      message: '✅dependabot config looks good 👍',
      raw: {errors: []}
    })
  })
  test('with errors', async () => {
    fetchMock.mockOnce(
      JSON.stringify({
        errors: [
          {
            title: 'Invalid',
            detail:
              "The property '#/updates/8/commit-message/prefix' was not of a maximum string length of 15",
            source: {
              pointer: '#/updates/8/commit-message/prefix'
            }
          },
          {
            title: 'Unparseable',
            detail:
              "(): could not find expected ':' while scanning a simple key at line 10 column 1"
          }
        ]
      })
    )
    expect(
      await validate('.github/dependabot.yml', '', '🚫 dependabot errors')
    ).toEqual({
      message: `
🚫 dependabot errors

| title | detail | source |
| ----- | ------ | ------ |
| Invalid | The property '#/updates/8/commit-message/prefix' was not of a maximum string length of 15 | #/updates/8/commit-message/prefix |
| Unparseable | (): could not find expected ':' while scanning a simple key at line 10 column 1 | undefined |
`,
      raw: {
        errors: [
          {
            detail:
              "The property '#/updates/8/commit-message/prefix' was not of a maximum string length of 15",
            source: {
              pointer: '#/updates/8/commit-message/prefix'
            },
            title: 'Invalid'
          },
          {
            title: 'Unparseable',
            detail:
              "(): could not find expected ':' while scanning a simple key at line 10 column 1"
          }
        ]
      }
    })
  })
})
