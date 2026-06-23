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

Releases are automated on push to `main`. Bump `version` in [`packages/blog/package.json`](packages/blog/package.json) before merging.

When CI merges to `main`, [`.github/workflows/publish.yml`](.github/workflows/publish.yml):

1. Runs tests and typecheck
2. Reads the release version from `packages/blog/package.json`
3. If git tag `v<version>` does not exist yet → creates the tag and publishes `@mdg-labs/blog` to npm
4. If the tag already exists → skips (no duplicate publish)

Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC from GitHub Actions). No `NPM_TOKEN` or other publish secret is required — configure the trusted publisher on npmjs.com (package → Settings → Trusted publishing → workflow `publish.yml`).

**Manual publish** (emergency only):

```bash
cd packages/blog
npm publish --access public
```

Requires `npm login` with publish access to the `@mdg-labs` scope on npm.
