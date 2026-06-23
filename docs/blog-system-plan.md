# Shared blog system — implementation spec

> **Status:** Implementation spec v5  
> **Authority:** Product/architecture spec for `@mdg-labs/blog` and all consumer sites  
> **Repo:** [`mdg-labs/blog`](https://github.com/mdg-labs/blog) — this document lives here (`docs/blog-system-plan.md`)

---

## 0. Implementation status

| Item | State | Notes |
|---|---|---|
| Architecture | **Done** | Astro-only marketing; Content Collections + `@astrojs/mdx`; `@mdg-labs/blog` |
| `mdg-labs/blog` repo | **Created** | Empty scaffold — **start at Phase 0** below |
| PipeWatch marketing → Astro | **Largely done** | Use `content.config.ts` + `privacy.astro` as MDX reference |
| SlugBase marketing | Astro 6 | No blog yet |
| MDG Labs roof | Astro 5 | Pilot consumer after Phase 0 |
| Blog on any site | **Not started** | Blocked on Phase 0 completion |

**Policy:** All MDG Labs **marketing** sites are Astro. Product **apps** stay on their application stacks.

---

## 1. Goals

| Goal | Detail |
|---|---|
| One package | `@mdg-labs/blog` — schema, MDX components, helpers, route templates |
| One MDX pipeline | Astro Content Collections + `@astrojs/mdx` on every consumer |
| One author workflow | Add MDX under `content/blog`; `astro build` |
| Static post bodies | `getCollection` + `render(entry)`; no runtime MDX in the browser |
| SEO | RSS, JSON-LD `BlogPosting`, sitemap, article OG |

### Non-goals (v1)

Comments, search UI, CMS, cross-site syndication, customer docs (`docs.*.app`), blog inside product apps.

---

## 2. Package distribution

| Channel | Use |
|---|---|
| **npmjs** (`registry.npmjs.org`) | **Production** — public `@mdg-labs/blog`; versioned installs in CI and deployed builds |
| **`file:` dependency** | **Local dev only** — multi-root workspace while iterating |
| **GitHub Packages** | **No** — superseded by npmjs (2026-06) |
| **Committed tarballs** | **No** |

### Consumer install (CI + production)

No `.npmrc` or registry token required — the package is public on npm:

```bash
npm install @mdg-labs/blog@^0.1.1
```

### Local dev (workspace)

```json
"@mdg-labs/blog": "file:../../../blog/packages/blog"
```

Adjust relative path per consumer repo depth. Replace with semver (`^0.1.1`) after Phase 0G publish.

---

## 3. Workspace map

| Site | Repo path | Astro | Deploy | Locales | Blog `contentBase` |
|---|---|---|---|---|---|
| MDG Labs roof | `website/` | 5.x static | CF Workers | `en`, `de` | `./src/content/blog` |
| SlugBase marketing | `slugbase/packages/marketing/` | 6.x static | CF Workers | `en`, `de` | `./src/content/blog` |
| PipeWatch marketing | `pipewatch/apps/marketing/` | 6.x server+prerender | CF Workers | `en` | `./content/blog` |
| Blog package | `blog/packages/blog/` | library | npmjs | — | — |

**Workspace:** `website/mdg-labs.code-workspace` includes `../blog`.

---

## 4. `@mdg-labs/blog` — package contract

### 4.1 Target repo layout

```
blog/
├── README.md
├── docs/
│   └── blog-system-plan.md          # this file
├── package.json
├── pnpm-workspace.yaml
├── .github/workflows/ci.yml
├── packages/blog/
│   ├── package.json                   # @mdg-labs/blog
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   ├── collection.ts
│   │   ├── filters.ts
│   │   ├── dates.ts
│   │   ├── slug.ts
│   │   ├── rss.ts
│   │   ├── json-ld.ts
│   │   ├── validate.ts
│   │   ├── mdx/
│   │   │   ├── components.ts
│   │   │   ├── Callout.astro
│   │   │   └── CodeBlock.astro
│   │   └── layouts/
│   │       ├── BlogPostLayout.astro
│   │       ├── PostList.astro
│   │       └── PostCard.astro
│   ├── styles/blog-prose.css
│   ├── templates/pages/               # copy into consumers
│   ├── bin/blog-validate.mjs
│   └── vitest/
│       ├── schema.test.ts
│       ├── rss.test.ts
│       ├── slug.test.ts
│       └── validate.test.ts
```

### 4.2 `package.json` exports

```json
{
  "name": "@mdg-labs/blog",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema.ts",
    "./mdx": "./src/mdx/components.ts",
    "./layouts/BlogPostLayout.astro": "./src/layouts/BlogPostLayout.astro",
    "./layouts/PostList.astro": "./src/layouts/PostList.astro",
    "./layouts/PostCard.astro": "./src/layouts/PostCard.astro",
    "./styles/blog-prose.css": "./styles/blog-prose.css"
  },
  "bin": { "blog-validate": "./bin/blog-validate.mjs" },
  "peerDependencies": {
    "astro": "^5.0.0 || ^6.0.0",
    "@astrojs/mdx": "^4.0.0 || ^5.0.0",
    "zod": "^3.25.0"
  }
}
```

### 4.3 Public API

| Export | Behaviour |
|---|---|
| `defineBlogCollection(options)` | `defineCollection` + `glob` loader + `blogPostSchema` |
| `blogPostSchema` | Zod frontmatter (§5) |
| `blogMdxComponents` | Map for `<Content components={...} />` |
| `sortPostsByDate`, `filterByLocale`, `filterPublished`, `paginate` | Collection helpers |
| `resolvePostSlug(entry)` | `data.slug` or directory name from entry id |
| `resolveTranslationKey(entry)` | Shared folder key after locale segment |
| `buildTranslationIndex(posts)` | Map translation key → locale → slug |
| `resolveBlogLocalePaths(entry, posts, options?)` | EN/DE public paths for switcher + hreflang |
| `resolveBlogAlternateHref(entry, posts, options?)` | Target path for language toggle |
| `formatPostDate(date, locale)` | Display formatting |
| `buildRssFeed({ site, posts, locale? })` | RSS XML string |
| `buildBlogPostingJsonLd(post, site)` | JSON-LD object |
| `validateBlogContent(contentBase, options?)` | Programmatic validation |

`defineBlogCollection` uses `astro/zod` schema when installed in consumer (same pattern as PipeWatch `changelog` / `legal`).

---

## 5. Content model

### 5.1 Frontmatter schema

| Field | Type | Required |
|---|---|---|
| `title` | string, max 120 | yes |
| `description` | string, max 300 | yes |
| `pubDate` | coerce date | yes |
| `updatedDate` | coerce date | no |
| `slug` | kebab-case | no (default from folder) |
| `locale` | `en` \| `de` | yes |
| `draft` | boolean, default false | no |
| `tags` | string[] | no |
| `author` | string | no |
| `heroImage` | string (relative) | no |
| `ogImage` | string | no |
| `canonicalUrl` | URL | no |

### 5.2 Post file layout

```
<contentBase>/
  en/welcome/index.mdx      # slug: welcome
  de/welcome/index.mdx      # slug: willkommen (folder name links translations)
  my-post/index.mdx         # PipeWatch (en only)
```

Shared folder name (after the locale segment) is the **translation key**. Per-locale `slug` in frontmatter may differ; `resolveBlogLocalePaths` maps switcher + hreflang URLs.

Public URL: `/blog/<slug>/` (from frontmatter `slug`, or folder name when omitted).

---

## 6. Consumer integration (summary)

Detailed checklists live in **Phase 1–3** below. Canonical render pattern (match PipeWatch `privacy.astro`):

```astro
---
import { getCollection, render } from "astro:content";
import { blogMdxComponents, filterPublished, resolvePostSlug } from "@mdg-labs/blog";
import BlogPostLayout from "@mdg-labs/blog/layouts/BlogPostLayout.astro";

export const prerender = true; // PipeWatch only

export async function getStaticPaths() {
  const posts = filterPublished(await getCollection("blog"));
  return posts.map((entry) => ({
    params: { slug: resolvePostSlug(entry) },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content, headings } = await render(entry);
---

<BlogPostLayout post={entry.data} headings={headings}>
  <Content components={blogMdxComponents} />
</BlogPostLayout>
```

---

## 7. Blog vs changelog vs customer docs

| Surface | URL | Collection |
|---|---|---|
| Blog | `/blog/<slug>/` | `blog` |
| Changelog | `/changelog` | `changelog` (PipeWatch) |
| Legal | `/privacy`, `/terms` | `legal` (PipeWatch) |
| Customer docs | `docs.*.app` | external `*-docs` repos |

---

## 8. Implementation phases

Phases **0A–0G** are entirely in the **`blog/` repo**. Phases **1–3** are consumer sites. Do not start Phase 1 until **Phase 0F** acceptance criteria pass.

---

### Phase 0A — Repo & workspace scaffold

**Repo:** `blog/`

| # | Task |
|---|---|
| 0A.1 | Add root `package.json` with `private: true`, scripts `test` / `typecheck` fan-out |
| 0A.2 | Add `pnpm-workspace.yaml` → `packages/*` |
| 0A.3 | Add `packages/blog/package.json` per §4.2 (version `0.0.0`) |
| 0A.4 | Add `packages/blog/tsconfig.json` (strict, `moduleResolution: bundler`) |
| 0A.5 | Add root `README.md` — one paragraph + link to `docs/blog-system-plan.md` |
| 0A.6 | Add `.gitignore` — `node_modules`, `dist`, `.turbo` |

**Acceptance criteria**

- [x] `pnpm install` succeeds from `blog/` root
- [x] `packages/blog` resolves as workspace package `@mdg-labs/blog`
- [x] `pnpm -r typecheck` runs (may be empty/no-op until 0B)

---

### Phase 0B — Schema & collection

**Repo:** `blog/packages/blog/`

| # | Task |
|---|---|
| 0B.1 | Implement `src/schema.ts` — `blogPostSchema` + exported type `BlogPostFrontmatter` |
| 0B.2 | Implement `src/collection.ts` — `defineBlogCollection({ contentBase, locales, defaultAuthor? })` using `glob` loader |
| 0B.3 | Export both from `src/index.ts` |
| 0B.4 | Add `vitest/schema.test.ts` — valid/invalid frontmatter cases |

**Acceptance criteria**

- [x] `blogPostSchema.safeParse` rejects missing `title`, bad `slug`, invalid `locale`
- [x] `defineBlogCollection` returns an object with `loader` + `schema` keys (unit test or snapshot)
- [x] `pnpm test` passes

---

### Phase 0C — Collection utilities

| # | Task |
|---|---|
| 0C.1 | `src/slug.ts` — `slugify`, `resolvePostSlug(entry)` |
| 0C.2 | `src/dates.ts` — `formatPostDate` |
| 0C.3 | `src/filters.ts` — `sortPostsByDate`, `filterByLocale`, `filterPublished`, `paginate` |
| 0C.4 | `src/rss.ts` — `buildRssFeed` |
| 0C.5 | `src/json-ld.ts` — `buildBlogPostingJsonLd` |
| 0C.6 | Vitest for slug, RSS XML shape, JSON-LD required fields |

**Acceptance criteria**

- [x] `sortPostsByDate` orders newest `pubDate` first
- [x] `filterPublished` excludes `draft: true`
- [x] `filterByLocale` keeps only matching `data.locale`
- [x] `buildRssFeed` output contains `<rss`, item `<title>`, `<link>`, parseable XML
- [x] `buildBlogPostingJsonLd` returns `@type: BlogPosting` with `headline`, `datePublished`
- [x] `pnpm test` passes

---

### Phase 0D — MDX components & layouts

| # | Task |
|---|---|
| 0D.1 | `src/mdx/Callout.astro` — `type: info \| warn`, class `blog-callout` |
| 0D.2 | `src/mdx/CodeBlock.astro` — class `blog-code-block` |
| 0D.3 | `src/mdx/components.ts` — export `blogMdxComponents` map |
| 0D.4 | `src/layouts/BlogPostLayout.astro` — title, date, tags slot, prose wrapper |
| 0D.5 | `src/layouts/PostCard.astro`, `PostList.astro` |
| 0D.6 | `styles/blog-prose.css` — semantic classes only (`.blog-prose`, headings, links) |

**Acceptance criteria**

- [x] All layouts export valid Astro components (no TS errors)
- [x] `blogMdxComponents` includes `Callout` and `CodeBlock`
- [x] CSS file importable via `@mdg-labs/blog/styles/blog-prose.css`
- [x] `pnpm typecheck` passes

---

### Phase 0E — `blog-validate` CLI

| # | Task |
|---|---|
| 0E.1 | `src/validate.ts` — walk `contentBase`, parse frontmatter, run `blogPostSchema` |
| 0E.2 | Detect duplicate slugs per locale |
| 0E.3 | Optional: warn when `heroImage` path missing on disk |
| 0E.4 | `bin/blog-validate.mjs` — argv: `<contentBase>`; exit 1 on failure |
| 0E.5 | `vitest/validate.test.ts` with fixture MDX files in `vitest/fixtures/` |

**Acceptance criteria**

- [x] `blog-validate vitest/fixtures/valid` exits 0
- [x] `blog-validate vitest/fixtures/invalid` exits non-zero with readable error on stderr
- [x] Duplicate slug fixture fails validation
- [x] `pnpm test` passes

---

### Phase 0F — Route templates & docs

| # | Task |
|---|---|
| 0F.1 | `templates/pages/blog-index.astro` — list using `PostList` |
| 0F.2 | `templates/pages/blog-post.astro` — full render pattern §6 |
| 0F.3 | `templates/pages/blog-rss.xml.ts` — `GET` + `buildRssFeed` |
| 0F.4 | `templates/pages/de/blog-index.astro`, `de/blog-post.astro` — locale filter |
| 0F.5 | `templates/content.config.snippet.ts` — commented copy-paste for consumers |
| 0F.6 | Add `fixtures/example-post/` sample MDX for manual smoke in a consumer |

**Acceptance criteria**

- [x] Templates are valid `.astro` / `.ts` (syntax check; no missing imports from `@mdg-labs/blog`)
- [x] README in `templates/README.md` explains copy steps per consumer
- [x] **Phase 0 gate:** `pnpm test && pnpm typecheck` green at repo root

---

### Phase 0G — CI & npm publish

| # | Task |
|---|---|
| 0G.1 | `.github/workflows/ci.yml` — on PR/push: `pnpm install`, `pnpm test`, `pnpm typecheck` |
| 0G.2 | Add `publishConfig` to `packages/blog/package.json`: `"access": "public"` |
| 0G.3 | `.github/workflows/publish.yml` — tag + `npm publish` via trusted publishing (OIDC) on push to `main` |
| 0G.4 | Document install instructions in root `README.md` |

**Acceptance criteria**

- [x] CI green on default branch
- [x] `@mdg-labs/blog` installable from npm (migrated from GitHub Packages @0.1.0 → npmjs @0.1.1)
- [x] Version in `package.json` bumped on publish tag

---

### Phase 1 — Roof pilot (`website/`)

**Depends on:** Phase 0F (local `file:`) or 0G (registry)

| # | Task |
|---|---|
| 1.1 | Add `@mdg-labs/blog`, `@astrojs/mdx` to `package.json` |
| 1.2 | `astro.config.mjs` — `mdx()` integration |
| 1.3 | `src/content.config.ts` — `blog` collection |
| 1.4 | Copy/adapt templates → `src/pages/blog/`, `src/pages/de/blog/` |
| 1.5 | `src/styles/blog.css` — roof token bridge |
| 1.6 | Nav + i18n keys; sample `en` + `de` posts |
| 1.7 | CI: `blog-validate` + `astro build` |

**Acceptance criteria**

- [x] `npm run build` passes
- [x] `/blog/<slug>/`, `/de/blog/<slug>/` render MDX + `Callout`
- [x] `/blog/rss.xml` valid
- [x] Draft excluded from index and RSS
- [x] Sitemap includes blog URLs

---

### Phase 2 — SlugBase marketing

**Depends on:** Phase 1 learnings; Phase 0G recommended

Same as Phase 1 with `MarketingLayout`, `@slugbase/ui` prose, marketing i18n keys.

**Acceptance criteria**

- [ ] Phase 1 criteria on `slugbase` marketing build
- [ ] Legal pages unchanged

---

### Phase 3 — PipeWatch marketing

**Depends on:** Phase 0F+; Astro migration complete

Extend `src/content.config.ts`; `content/blog/`; `prerender = true` on blog routes.

**Acceptance criteria**

- [ ] `pnpm build` in `apps/marketing`
- [ ] `/blog`, `/blog/<slug>/`, `/blog/rss.xml` — 200
- [ ] `/changelog`, `/privacy`, `/terms` unchanged

---

### Phase 4 — Polish (defer)

Auto OG images, locale-pair validation, tag pages, Keystatic.

---

## 9. CI commands (reference)

**`blog/` repo (every PR):**

```bash
pnpm install
pnpm test
pnpm typecheck
```

**Each consumer (after integration):**

```bash
blog-validate <contentBase>
astro build
```

---

## 10. Settled decisions

| Topic | Decision |
|---|---|
| Package / repo | `@mdg-labs/blog` in `mdg-labs/blog` |
| Registry | Public npmjs (`@mdg-labs/blog`) — publish via trusted publishing (GitHub Actions OIDC) |
| Local `file:` | Dev workspace only |
| Framework | Astro marketing only |
| Content API | Content Collections + `glob` loader |
| PipeWatch `contentBase` | `./content/blog` |
| Roof / SlugBase `contentBase` | `./src/content/blog` |
| Cross-framework | No Velite, no `next-mdx-remote` for blog |

---

## 11. References

| Path | Why |
|---|---|
| `pipewatch/apps/marketing/src/content.config.ts` | Collection pattern |
| `pipewatch/apps/marketing/src/pages/privacy.astro` | MDX render pattern |
| `website/src/components/SeoHead.astro` | Roof SEO / hreflang |
| `slugbase/packages/marketing/src/layouts/MarketingLayout.astro` | Product shell |

### External

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)

### Revision history

| Version | Summary |
|---|---|
| v1–v3 | See git history in `website` repo |
| v4 | Implementation checklists; lived in `website/docs/` |
| **v5** | Canonical doc in `blog/docs/`; Phase 0A–0G with acceptance criteria; npmjs distribution |
