# @mdg-labs/blog

Shared Astro blog infrastructure for MDG Labs marketing sites. See [`docs/blog-system-plan.md`](docs/blog-system-plan.md) for the full specification and implementation phases.

## Install

### npm (CI and production)

The package is published publicly on [npmjs](https://www.npmjs.com/package/@mdg-labs/blog). No `.npmrc` or registry token is required to install:

```bash
npm install @mdg-labs/blog@^0.1.1
# or
pnpm add @mdg-labs/blog@^0.1.1
```

### Local development (workspace)

While iterating across repos in a multi-root workspace, use a `file:` dependency instead of the registry:

```json
"@mdg-labs/blog": "file:../../../blog/packages/blog"
```

Adjust the relative path for your consumer repo depth. Switch to a semver pin (`^0.1.1`) after the package is published to npm.

## Publishing

Releases are automated on push to `main`. Bump `version` in **both** [`package.json`](package.json) (workspace root) and [`packages/blog/package.json`](packages/blog/package.json) in the same commit before merging.

When CI merges to `main`, [`.github/workflows/publish.yml`](.github/workflows/publish.yml):

1. Runs tests and typecheck
2. Verifies root and package versions match
3. If git tag `v<version>` does not exist yet → creates the tag and publishes `@mdg-labs/blog` to npm
4. If the tag already exists → skips (no duplicate publish)

The workflow requires an `NPM_TOKEN` repository secret (npm **Automation** token with publish access to `@mdg-labs/blog`).

**Manual publish** (emergency only):

```bash
cd packages/blog
pnpm publish --no-git-checks --access public
```

Requires `NODE_AUTH_TOKEN` (or `npm login`) with publish access to the `@mdg-labs` scope on npm.
