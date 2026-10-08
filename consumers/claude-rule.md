---
description: Consume @mdg-labs/blog from npm — publish-first semver, validate before build, never a file: dependency
---

# `@mdg-labs/blog` — consumer rules

This repo **consumes** [`@mdg-labs/blog`](https://www.npmjs.com/package/@mdg-labs/blog). The package is implemented in [`mdg-labs/blog`](https://github.com/mdg-labs/blog), not here. Its README has the full integration manual (MDX, content collection, route templates, styling, CI).

## Install

From the public npm registry (`registry.npmjs.org`) — no token or `.npmrc` needed:

```json
"@mdg-labs/blog": "^<published version>"
```

Peer dependencies: `astro` 5–7 and `@astrojs/mdx` within the range the package declares.

## Publish first

When this site needs a new export, schema field, layout or CLI behaviour:

1. Implement it in `mdg-labs/blog`, bump `packages/blog/package.json`, and promote it to `main` there — that publishes to npm.
2. Only after the version exists on npm, bump it here, refresh the lockfile, and build.

Never commit `"@mdg-labs/blog": "file:../blog/packages/blog"`, never patch `node_modules/@mdg-labs/blog`, and never import a symbol that isn't published yet. If the work needs an unpublished API, report it **blocked** and name the version it needs.

## Gate

Validate posts before the build, in the local gate and in CI:

```bash
node --import tsx node_modules/@mdg-labs/blog/bin/blog-validate.ts <contentBase>
```

## Content

- Posts are MDX at `<contentBase>/<locale>/<folder>/index.mdx` with `title`, `description`, `pubDate` and `locale`.
- Bilingual sites use matching folder names under each locale so translations link up.
- `draft: true` keeps a post out of the index and RSS.
