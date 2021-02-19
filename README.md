<p align="center">
  <a href="https://github.com/marocchino/validate-dependabot/actions"><img alt="typescript-action status" src="https://github.com/marocchino/validate-dependabot/workflows/build-test/badge.svg"></a>
</p>

## Inputs

### `path`

**Required** The name of the person to greet. Default `"World"`.

## Outputs

### `raw`

response body as json string

### `markdown`

errors as markdown table

## Usage

```yaml
- uses: marocchino/validate-dependabot@v1
  id: validate
- uses: marocchino/sticky-pull-request-comment@v2
  with:
    header: validate-dependabot
    message: ${{ steps.validate.outputs.markdown }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
