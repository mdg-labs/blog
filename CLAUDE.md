# @mdg-labs/blog

The shared blog package for MDG Labs' Astro marketing sites. Setup, public API and publishing are in [README.md](README.md).

## Agent workflow

<!-- Read by the vendored skills under .claude/skills/. Keep these headings exactly.
     Machine-read settings live in .claude/workflow.json. -->

### Project

`@mdg-labs/blog`, a public npm package (`packages/blog`, pnpm workspace) that gives every MDG Labs Astro marketing site one blog: a content-collection schema and `defineBlogCollection`, MDX components, layouts (`BlogPostLayout`, `PostList`, `PostCard`), prose styles, RSS and JSON-LD builders, slug, locale and translation helpers, copyable route templates, and the `blog-validate` CLI. Consumers are `mdg-labs/website` (live) and the SlugBase and PipeWatch marketing sites (planned). Releases publish to npm from `main`.

### Design docs

- [docs/blog-system-plan.md](docs/blog-system-plan.md) — the implementation spec (v5): distribution (§2), package contract (§4, exports §4.2, public API §4.3), content model (§5), phases (§8), CI commands (§9), settled decisions (§10). Its §0 status table predates the releases; the issues and README are current.
- [README.md](README.md) — the consumer integration manual and public API, kept in step with the code.
- [packages/blog/templates/README.md](packages/blog/templates/README.md) — the route templates consumers copy.

### Area → paths

| Label | Paths |
|-------|-------|
| `area:package` | `packages/blog/src/`, `packages/blog/bin/`, `packages/blog/styles/`, `packages/blog/vitest/`, `packages/blog/fixtures/` |
| `area:consumer` | `README.md`, `packages/blog/templates/`, `consumers/` |
| `area:ci` | `.github/` |

### Always-shared files

`packages/blog/package.json`, `pnpm-lock.yaml`, `package.json`, `packages/blog/src/index.ts`, `README.md`, `consumers/claude-rule.md`.

### Entry points

The package's `exports` and `bin` in `packages/blog/package.json`: `src/index.ts` (and `./schema`, `./mdx`), the three layouts, `styles/blog-prose.css`, and `bin/blog-validate.mjs` → `bin/blog-validate.ts`. A capability is reachable when it is exported there (or is a template consumers copy) and the README documents it.

### Hazards

- Consumer repos (`../website`, `../slugbase`, `../slugbase-cloud`, `../pipewatch`) are read-only from here. A consumer change is its own item in that repo, after the release it needs is on npm.
- Every push to `main` that carries a new `version` publishes to npm (`.github/workflows/publish.yml`, trusted publishing). Only a `dev` → `main` promotion moves `main`.

### Implementation rules

- **No build step:** `exports` point at TypeScript and Astro source, so whatever is in `src/` ships as-is.
- **The public contract** is `exports`, `bin`, the frontmatter schema and the peer ranges (`astro` 5–7, `@astrojs/mdx` 4–7). Changing any of them bumps `packages/blog/package.json` `version` by semver, and updates the README and `consumers/claude-rule.md` in the same commit.
- `bin/blog-validate.ts` is called by path in consumer CI (`node --import tsx node_modules/@mdg-labs/blog/bin/blog-validate.ts`); keep that path working.
- MDX goes through Astro content collections and `@astrojs/mdx` only — never Velite or `next-mdx-remote`.
- Consumers install from npm; never suggest a `file:` dependency.

### Risk review

For a change to the package contract: does every existing consumer setup still work unchanged (schema accepts the fixtures and existing posts, exports keep their names and paths, `blog-validate` keeps its path and exit codes)? If not, is the version bump major-for-breaking and is the migration in the README? Do the vitest suites cover the new behaviour against `fixtures/` and the templates?
