# @mdg-labs/blog

Shared Astro blog infrastructure for MDG Labs **marketing** sites — content schema, MDX components, layouts, RSS/JSON-LD helpers, and a `blog-validate` CLI.

| | |
|---|---|
| **npm** | [`@mdg-labs/blog`](https://www.npmjs.com/package/@mdg-labs/blog) (public, no token required) |
| **Latest** | `0.1.3` |
| **Repo** | [`mdg-labs/blog`](https://github.com/mdg-labs/blog) |
| **Spec** | [`docs/blog-system-plan.md`](docs/blog-system-plan.md) |

**Policy:** blog lives on Astro marketing sites only. Product apps (SlugBase web, PipeWatch dashboard, etc.) stay on their application stacks.

---

## Prerequisites

Before adding `@mdg-labs/blog` to a site, confirm the following.

### Runtime

| Requirement | Detail |
|---|---|
| **Site type** | Astro **marketing** site with Content Collections |
| **Astro** | `^5.0.0`, `^6.0.0`, or `^7.0.0` (peer dependency) |
| **@astrojs/mdx** | `^4.0.0`, `^5.0.0`, or `^7.0.0` — major should match your Astro line |
| **Node.js** | `>=22.12` for Astro 7; `>=20` for Astro 5/6 |
| **Output** | Static build or prerendered routes (`export const prerender = true` on server sites) |

Schema validation uses **`astro/zod`** inside the package. Consumers do **not** need a separate `zod` dependency for the blog collection.

### What you provide on the consumer

- An Astro project with `mdx()` enabled in `astro.config`
- A `content.config.ts` (or `src/content.config.ts`) registering the `blog` collection
- Page routes for index, post detail, and optionally RSS
- Your site shell layout (nav, footer, SEO) wrapping package layouts
- Post files as MDX under a `contentBase` directory (see [Content layout](#content-layout))
- CI step running `blog-validate` before `astro build`

Copy-paste route templates live in [`packages/blog/templates/`](packages/blog/templates/README.md).

---

## Install

### npm / pnpm (CI and production)

```bash
npm install @mdg-labs/blog@^0.1.3 @astrojs/mdx
# or
pnpm add @mdg-labs/blog@^0.1.3 @astrojs/mdx
```

No `.npmrc` or registry token is required — the package is public on npmjs.

Pin `astro` and `@astrojs/mdx` to compatible versions in the same change. Example (Astro 7, current recommendation for new work and security fixes):

```json
{
  "dependencies": {
    "@mdg-labs/blog": "^0.1.3",
    "@astrojs/mdx": "^7.0.0",
    "astro": "^7.0.0"
  },
  "engines": {
    "node": ">=22.12 <25"
  }
}
```

### Local development (workspace)

While iterating across repos in a multi-root workspace, use a `file:` dependency:

```json
"@mdg-labs/blog": "file:../../../blog/packages/blog"
```

Adjust the relative path for your consumer repo depth. Switch to a semver pin (`^0.1.3`) before merging to a branch that deploys from npm.

---

## Consumer integration manual

Step-by-step guide for wiring the package into an MDG Labs marketing site.

### 1. Enable MDX

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  // site, i18n, output: 'static', etc.
});
```

### 2. Register the content collection

Create or extend `src/content.config.ts` (path varies per repo — see table below):

```ts
import { defineBlogCollection } from '@mdg-labs/blog';

const blog = defineBlogCollection({
  contentBase: './src/content/blog',
  locales: ['en', 'de'],
  defaultAuthor: 'MDG Labs', // optional
});

export const collections = { blog };
```

| Consumer | Config path | `contentBase` | `locales` |
|---|---|---|---|
| **website** (MDG Labs roof) | `src/content.config.ts` | `./src/content/blog` | `['en', 'de']` |
| **slugbase** marketing | `packages/marketing/src/content.config.ts` | `./src/content/blog` | `['en', 'de']` |
| **pipewatch** marketing | `apps/marketing/src/content.config.ts` | `./content/blog` | `['en']` |

Merge with existing collections (`changelog`, `legal`, …) — export one `collections` object.

Reference: [`packages/blog/templates/content.config.snippet.ts`](packages/blog/templates/content.config.snippet.ts)

### 3. Copy route templates

From [`packages/blog/templates/pages/`](packages/blog/templates/pages/):

| Template | Typical destination |
|---|---|
| `blog-index.astro` | `src/pages/blog/index.astro` |
| `blog-post.astro` | `src/pages/blog/[slug].astro` |
| `blog-rss.xml.ts` | `src/pages/blog/rss.xml.ts` |
| `de/blog-index.astro` | `src/pages/de/blog/index.astro` (bilingual sites only) |
| `de/blog-post.astro` | `src/pages/de/blog/[slug].astro` (bilingual sites only) |

Adapt each template:

- Wrap `PostList` / `BlogPostLayout` in your site layout (`BaseLayout`, `MarketingLayout`, …)
- Set `filterByLocale(..., 'en' | 'de')` on index and detail routes
- On PipeWatch (server + prerender), keep `export const prerender = true` on blog routes
- Set `site.name` / `site.url` in the RSS endpoint

Full per-site checklist: [`packages/blog/templates/README.md`](packages/blog/templates/README.md)

### 4. Style MDX output

Import package prose styles and bridge to your design tokens:

```astro
---
import '@mdg-labs/blog/styles/blog-prose.css';
// plus site-specific overrides, e.g. @/styles/blog.css
---
```

`Callout` and `CodeBlock` MDX components map through `blogMdxComponents`:

```astro
---
import { blogMdxComponents } from '@mdg-labs/blog';
const { Content } = await render(entry);
---

<Content components={blogMdxComponents} />
```

### 5. Write posts

See [Content layout](#content-layout). Start from [`packages/blog/fixtures/example-post/`](packages/blog/fixtures/example-post/).

### 6. Validate and build locally

```bash
# From consumer repo root — adjust contentBase path per site
npx blog-validate src/content/blog

astro check   # if configured
astro build
```

### 7. Add CI gate

Run validation before build. Example from **website** (npm):

```yaml
- run: npm ci
- run: node --import tsx node_modules/@mdg-labs/blog/bin/blog-validate.ts src/content/blog
- run: npm run check
- run: npm run build
- run: npm audit --audit-level=high
```

PipeWatch uses `blog-validate content/blog` (no `src/` prefix).

---

## Content layout

Posts are MDX files with YAML frontmatter. Folder name becomes the URL slug unless `slug` is set.

```
<contentBase>/
  en/welcome/index.mdx
  de/willkommen/index.mdx
  my-post/index.mdx          # single-locale sites (e.g. PipeWatch)
```

Public URLs: `/blog/<slug>/` (and `/de/blog/<slug>/` for German routes on bilingual sites).

### Frontmatter schema

| Field | Type | Required |
|---|---|---|
| `title` | string, max 120 | yes |
| `description` | string, max 300 | yes |
| `pubDate` | date (`YYYY-MM-DD`) | yes |
| `locale` | `en` \| `de` | yes |
| `updatedDate` | date | no |
| `slug` | kebab-case | no (defaults to folder name) |
| `draft` | boolean, default `false` | no |
| `tags` | string[] | no |
| `author` | string | no |
| `heroImage` | relative path | no |
| `ogImage` | URL or path | no |
| `canonicalUrl` | URL | no |

Drafts are excluded from indexes and RSS via `filterPublished`.

---

## Public API

| Export | Purpose |
|---|---|
| `defineBlogCollection(options)` | Register `blog` collection with glob loader + schema |
| `blogPostSchema` | Frontmatter Zod schema (`astro/zod`) |
| `blogMdxComponents` | MDX component map (`Callout`, `CodeBlock`) |
| `sortPostsByDate`, `filterByLocale`, `filterPublished`, `paginate` | Collection helpers |
| `resolvePostSlug(entry)` | Slug for `getStaticPaths` params |
| `formatPostDate(date, locale)` | Display formatting |
| `buildRssFeed({ site, posts, locale? })` | RSS XML string |
| `buildBlogPostingJsonLd(post, site)` | JSON-LD `BlogPosting` object |
| `validateBlogContent(contentBase, options?)` | Programmatic validation |
| `@mdg-labs/blog/layouts/*` | `BlogPostLayout`, `PostList`, `PostCard` |
| `@mdg-labs/blog/styles/blog-prose.css` | Base prose styles |
| `blog-validate` (bin) | CLI — exits non-zero on schema/duplicate errors |

---

## Development (this repo)

pnpm workspace at repo root; package source in `packages/blog/`.

```bash
pnpm install
pnpm test        # vitest — schema, RSS, slug, validate, templates
pnpm typecheck   # tsc --noEmit
```

CI runs on pull requests and pushes to `main` / `dev` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

---

## Publishing

Releases are automated on push to `main`. Bump `version` in [`packages/blog/package.json`](packages/blog/package.json) before merging.

[`.github/workflows/publish.yml`](.github/workflows/publish.yml) then:

1. Runs tests and typecheck
2. Reads the version from `packages/blog/package.json`
3. If git tag `v<version>` does not exist → creates the tag and publishes to npmjs
4. If the tag already exists → skips (no duplicate publish)

Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC from GitHub Actions). Configure on npmjs.com: package **@mdg-labs/blog** → Settings → Trusted publishing → workflow `publish.yml`. No `NPM_TOKEN` is stored in GitHub.

**Manual publish** (emergency only):

```bash
cd packages/blog
npm publish --access public
```

Requires `npm login` with publish access to the `@mdg-labs` scope.

---

## Consumers

| Site | Repo | Status |
|---|---|---|
| MDG Labs roof | `website/` | Live — Astro 7, `@mdg-labs/blog@^0.1.3` |
| SlugBase marketing | `slugbase/packages/marketing/` | Planned |
| PipeWatch marketing | `pipewatch/apps/marketing/` | Planned |

For architecture, phases, and acceptance criteria, see [`docs/blog-system-plan.md`](docs/blog-system-plan.md).
