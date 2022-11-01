# conventional-release-note

<p>
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

## Usage

### Explanation of options

````yaml
- uses: conventional-release-note@v1
  with:
    # Decides what kind of the commit convention you would like to use. Now the action has only "default".
    kind: default
    # Filters tags by this option. This will be used as a parameter of `git tag --list [tag-pattern]`.
    # If this passed with empty string, `git tag` will be executed. It means getting all tags indiscriminately.
    tag-pattern: v*
    # Sets the previous tag. This will be used in extracting logs in the specific range of tags.
    # Logs are extracted in condition of `${previous-tag}...${current-tag}`.
    # This option decides what tag you'd like to set as the start of the range.
    # You don't need to set this options as usual, but you can set a specific tag whatever you like.
    previous-tag: v0.1.0
    # Sets the current tag. This will be used in extracting logs in the specific range of tags.
    # Logs are extracted in condition of `${previous-tag}...${current-tag}`.
    # This option decides what tag you'd like to set as the end of the range.
    # The default value is `${{ github.ref_name }}`, but you can set a specific tag whatever you like.
    current-tag: ${{ github.ref_name }}
    # If scopes are set, this action will only include commit logs with their scopes (others are excluded).
    # For example, assume that the following commit logs:
    # - feat(core): add a feature
    # - feat(util): add a feature
    # - feat(debug): add a feature
    # - feat: add a feature
    # And assume that the following `scopes` is set as well:
    # ```
    # - scopes |
    #     core
    #     util
    # ```
    # Then the following release note will be generated.
    # ```
    # ## Features
    # - feat(core): add a feature
    # - feat(util): add a feature
    # ```
    scopes: |
      core
      util
    # This option is for a use case to include commit logs without scopes even if "scopes" option is set.
    # For example, assume that the following commit logs:
    # - feat(util): add a feature
    # - feat: add a feature
    # - feat(debug): add a feature
    # And assume that the following `scopes` and `include-non-scoped` are set as well:
    # ```
    # - scopes |
    #     util
    # - include-non-scoped: true
    # ```
    # Then the following release note will be generated.
    # ```
    # ## Features
    # - feat(util): add a feature
    # - feat: add a feature
    # ```
    include-non-scoped: true
````

### Steps

1. Set each option.
2. Set `id` to the action to be able to get the result.
3. (Recommended) Integrate with `softprops/action-gh-release@v1`.

Here is an example to use this action:

```yaml
name: 'Create a new release note'
on:
  push:
    tags:
      - 'v*'

jobs:
  create-release-note:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Generated content
        uses: ./
        id: gen_note
        with:
          kind: default
          tag-pattern: v*
          current-tag: ${{ github.ref_name }}
      - name: Create a new release note
        uses: softprops/action-gh-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          name: Release ${{ github.ref_name }}
          body: ${{ steps.gen_note.outputs.summary }}
          draft: false
          prerelease: false
```

This action will be triggered every time we make a tag which starts with `v*`.

Please make sure to set `fetch-depth: 0` option to `actions/checkout@v2`. If not, you cannot fetch all tags.

`conventional-release-note` action will store the result into an "output" named `summary` so that it enables other actions to read the result via this variable from the latter actions.

This example shows reading a result from the "Generated content" action in the "Create a new release note" action, and using the `summary` to create a new release note. To generate a new release note, we recommend to use `softprops/action-gh-release@v1`.
