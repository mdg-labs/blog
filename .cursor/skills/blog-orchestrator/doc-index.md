# Blog — spec doc index

Quick reference for orchestrator **DOC REFERENCE** blocks. Sub-agents read these files — never paste bodies into prompts.

## Authority

| Shorthand | File | Covers |
|---|---|---|
| `spec` | `docs/blog-system-plan.md` | **Source of truth** — phases, API, acceptance criteria, consumer checklists |

Reference sections as `§N` or phase IDs, e.g. `spec §3.2`, `spec §10 Phase 0B`, `spec §5.2`.

## Phase map (orchestrator quick ref)

| Phase | Scope | Repo |
|---|---|---|
| 0A | Repo scaffold | `blog/` |
| 0B | Schema + `defineBlogCollection` | `blog/packages/blog/` |
| 0C | Utilities (slug, dates, filters, RSS, JSON-LD) | `blog/packages/blog/` |
| 0D | MDX components + layouts + CSS | `blog/packages/blog/` |
| 0E | `blog-validate` CLI | `blog/packages/blog/` |
| 0F | Route templates + Phase 0 gate | `blog/packages/blog/` |
| 0G | CI + GitHub Packages publish | `blog/` |
| 1 | Roof pilot | `website/` |
| 2 | SlugBase marketing | `slugbase/packages/marketing/` |
| 3 | PipeWatch marketing | `pipewatch/apps/marketing/` |
| 4 | Polish | defer |

## Consumer reference implementations (read-only for sub-agents)

| Path | Why |
|---|---|
| `pipewatch/apps/marketing/src/content.config.ts` | `glob` loader + Zod collections |
| `pipewatch/apps/marketing/src/pages/privacy.astro` | MDX `render()` + layout |
| `pipewatch/apps/marketing/astro.config.mjs` | `@astrojs/mdx` integration |
| `website/src/layouts/BaseLayout.astro` | Roof post shell |
| `website/src/components/SeoHead.astro` | hreflang + OG |
| `slugbase/packages/marketing/src/layouts/MarketingLayout.astro` | Product shell |

## Default verification commands

### `blog/` repo root

```bash
pnpm install
pnpm test
pnpm typecheck
```

### `website/` (Phase 1+)

```bash
npm run check
npm run build
blog-validate src/content/blog   # after CLI exists
```

### `slugbase/packages/marketing` (Phase 2+)

```bash
pnpm --filter @slugbase/marketing build
pnpm --filter @slugbase/marketing typecheck
```

### `pipewatch/apps/marketing` (Phase 3+)

```bash
pnpm --filter @pipewatch/marketing build
pnpm --filter @pipewatch/marketing typecheck
```

Run from repo root with `required_permissions: ["all"]` on first Shell attempt.

## Package distribution (spec §2)

- **Production:** GitHub Packages (`npm.pkg.github.com`) — not public npmjs
- **Local dev:** `file:../../../blog/packages/blog` in consumer `package.json`
- **No** committed tarballs

## GitHub tracking (issues only)

- Workflow: [github-issues.md](github-issues.md) — labels `status/ready` … `status/verified`
- Intake: [github-intake/SKILL.md](../github-intake/SKILL.md)
- **No** Projects v2 board
