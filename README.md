# @mdg-labs/blog

Shared Astro blog infrastructure for MDG Labs marketing sites. See [`docs/blog-system-plan.md`](docs/blog-system-plan.md) for the full specification and implementation phases.

## Install

### GitHub Packages (CI and production)

Add an org-scoped registry to `.npmrc` (user home or consumer repo root):

```ini
@mdg-labs:registry=https://npm.pkg.github.com
```

Authenticate with a token that has `read:packages` (or a repo-scoped `GITHUB_TOKEN` in CI):

```ini
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then add the dependency:

```bash
pnpm add @mdg-labs/blog@^0.1.0
```

### Local development (workspace)

While iterating across repos in a multi-root workspace, use a `file:` dependency instead of the registry:

```json
"@mdg-labs/blog": "file:../../../blog/packages/blog"
```

Adjust the relative path for your consumer repo depth. Switch to a semver pin (`^0.1.0`) after the package is published to GitHub Packages.

## Publishing

Publishing is **operator-only** — agents do not push packages.

**Automated (recommended):** push a version tag matching `packages/blog/package.json` (e.g. `v0.1.0`). The [`.github/workflows/publish.yml`](.github/workflows/publish.yml) workflow publishes `@mdg-labs/blog` to GitHub Packages using `GITHUB_TOKEN`.

**Manual:**

```bash
cd packages/blog
pnpm publish --no-git-checks
```

Requires `NODE_AUTH_TOKEN` (or `npm login`) with `write:packages` for `mdg-labs/blog`.
