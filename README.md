<p align="center">
  <a href="https://github.com/marocchino/validate-dependabot/actions"><img alt="typescript-action status" src="https://github.com/marocchino/validate-dependabot/workflows/build-test/badge.svg"></a>
</p>

## Why?

If you get a validation error when editing your config, you won't know if there's a problem until the next dependabot runs.
Even if the cycle is long and the alarm is not set, it may be detected much later.
This library allows you to find problems in the PR stage.

## Usage

```yaml
name: dependabot validate

on:
  pull_request:
    paths:
      - '.github/dependabot.yml'
      - '.github/workflows/dependabot-validate.yml'
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: marocchino/validate-dependabot@v2
        id: validate
      - uses: marocchino/sticky-pull-request-comment@v2
        if: always()
        with:
          header: validate-dependabot
          message: ${{ steps.validate.outputs.markdown }}
```

## Inputs

### `path`

**Required** path of config file. Default `".github/dependabot.yml"`.

### `success_message`

**Required** display on success. Default `"✅dependabot config looks good 👍"`.

### `failure_message`

**Required** display on failure. Default `"🚫 dependabot errors"`.

## Outputs

### `raw`

response body as json string

### `markdown`

errors as markdown table

## Any problem?

Feel free to report issues. 😃
