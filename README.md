<p align="center">
  <a href="https://github.com/marocchino/validate-dependabot/actions"><img alt="typescript-action status" src="https://github.com/marocchino/validate-dependabot/workflows/build-test/badge.svg"></a>
</p>

## Inputs

### `path`

**Required** path of config file. Default `".github/dependabot.yml"`.

## Outputs

### `raw`

response body as json string

### `markdown`

errors as markdown table

## Usage

```yaml
name: dependabot validate

on:
  pull_request:
    paths:
      - ".github/dependabot.yml"
      - ".github/workflows/dependabot-validate.yml"
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: marocchino/validate-dependabot@v1
        id: validate
      - uses: marocchino/sticky-pull-request-comment@v2
        if: always()
        with:
          header: validate-dependabot
          message: ${{ steps.validate.outputs.markdown }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
