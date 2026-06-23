# Route templates — copy into consumer sites

These files are **not** built by `@mdg-labs/blog`. Copy them into each Astro marketing site and adapt layout wrappers, `site` config, and i18n.

**Prerequisites:** `@mdg-labs/blog`, `@astrojs/mdx`, and `zod` installed; `mdx()` in `astro.config`; `blog` collection registered (see `content.config.snippet.ts`).

---

## 1. Register the content collection

Copy `content.config.snippet.ts` into your consumer `content.config.ts` (merge with existing collections).

| Consumer | Config path | `contentBase` | `locales` |
|---|---|---|---|
| **website** (MDG Labs roof) | `src/content.config.ts` | `./src/content/blog` | `["en", "de"]` |
| **slugbase** marketing | `packages/marketing/src/content.config.ts` | `./src/content/blog` | `["en", "de"]` |
| **pipewatch** marketing | `apps/marketing/src/content.config.ts` | `./content/blog` | `["en"]` |

Add sample posts under the `contentBase` path. Use `fixtures/example-post/` as a starting point.

---

## 2. Copy page templates

### website & slugbase (bilingual)

| Template | Copy to |
|---|---|
| `pages/blog-index.astro` | `src/pages/blog/index.astro` |
| `pages/blog-post.astro` | `src/pages/blog/[slug].astro` |
| `pages/blog-rss.xml.ts` | `src/pages/blog/rss.xml.ts` |
| `pages/de/blog-index.astro` | `src/pages/de/blog/index.astro` |
| `pages/de/blog-post.astro` | `src/pages/de/blog/[slug].astro` |

### pipewatch (English only)

| Template | Copy to |
|---|---|
| `pages/blog-index.astro` | `src/pages/blog/index.astro` |
| `pages/blog-post.astro` | `src/pages/blog/[slug].astro` |
| `pages/blog-rss.xml.ts` | `src/pages/blog/rss.xml.ts` |

Skip the `de/` templates on PipeWatch.

---

## 3. Per-consumer checklist

### website (`website/`)

1. Add dependency: `"@mdg-labs/blog": "file:../../../blog/packages/blog"` (local) or semver after Phase 0G.
2. `astro.config` — enable `mdx()` integration.
3. Merge `content.config.snippet.ts` → `src/content.config.ts`.
4. Copy templates → `src/pages/blog/` and `src/pages/de/blog/`.
5. Wrap `PostList` / `BlogPostLayout` in your roof `BaseLayout`; import `@mdg-labs/blog/styles/blog-prose.css` (or token-bridge in site CSS).
6. Set `site.name` / `site.url` in `blog-rss.xml.ts`.
7. Add `en` + `de` sample posts; run `blog-validate src/content/blog` and `astro build`.

**URLs:** `/blog/`, `/blog/<slug>/`, `/de/blog/`, `/de/blog/<slug>/`, `/blog/rss.xml`

### slugbase (`slugbase/packages/marketing/`)

Same steps as website. Use `MarketingLayout` and marketing i18n keys instead of roof layout. Legal pages must remain unchanged.

**URLs:** same pattern as website on the marketing host.

### pipewatch (`pipewatch/apps/marketing/`)

1. Add `@mdg-labs/blog` + `@astrojs/mdx` to `apps/marketing/package.json`.
2. Extend existing `src/content.config.ts` with the `blog` collection (`contentBase: "./content/blog"`, `locales: ["en"]`).
3. Copy three templates (no `de/` routes).
4. Keep `export const prerender = true` on all blog routes (server+prerender site).
5. Wrap layouts in `BaseLayout.astro`; set RSS `site` to `https://pipewatch.app` (or staging).
6. Run `blog-validate content/blog` and `pnpm build` in `apps/marketing`.

**URLs:** `/blog/`, `/blog/<slug>/`, `/blog/rss.xml` — changelog and legal routes unchanged.

---

## 4. Smoke test with example fixture

```bash
# From consumer repo after copying fixtures/example-post/ into contentBase:
blog-validate <contentBase>
astro build
```

Verify index lists the post, detail renders MDX + `Callout`, RSS contains an `<item>`, and drafts are excluded.

---

## 5. Import reference

All templates import from `@mdg-labs/blog`:

| Import | Use |
|---|---|
| `filterPublished`, `sortPostsByDate`, `filterByLocale` | Index and RSS |
| `resolvePostSlug` | `getStaticPaths` params |
| `blogMdxComponents` | `<Content components={...} />` |
| `buildRssFeed` | RSS endpoint |
| `defineBlogCollection` | `content.config.ts` |
| `@mdg-labs/blog/layouts/PostList.astro` | Blog index |
| `@mdg-labs/blog/layouts/BlogPostLayout.astro` | Post detail |

See `docs/blog-system-plan.md` §6 for the canonical render pattern.
