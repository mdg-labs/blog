# Cursor artifacts for `@mdg-labs/blog` consumers

Copy these into **Astro marketing sites** that consume `@mdg-labs/blog` (not into the `blog` package repo itself).

## What to copy

| Source (this repo) | Destination (consumer repo) |
|---|---|
| `dist/cursor/skill/mdg-labs-blog-consumer/` | `.cursor/skills/mdg-labs-blog-consumer/` |
| `dist/cursor/rule/mdg-labs-blog-consumer.mdc` | `.cursor/rules/mdg-labs-blog-consumer.mdc` |

```bash
# From a consumer repo root (adjust BLOG_REPO path)
BLOG_REPO=../blog

mkdir -p .cursor/skills/mdg-labs-blog-consumer
cp -r "$BLOG_REPO/dist/cursor/skill/mdg-labs-blog-consumer/"* .cursor/skills/mdg-labs-blog-consumer/
cp "$BLOG_REPO/dist/cursor/rule/mdg-labs-blog-consumer.mdc" .cursor/rules/
```

## What each artifact does

| Artifact | Role |
|---|---|
| **Rule** (`mdg-labs-blog-consumer.mdc`) | Always-on guardrails: publish-first semver workflow, no `file:` in commits, CI validation gate, where blog code lives |
| **Skill** (`mdg-labs-blog-consumer/SKILL.md`) | Full integration manual: install, content collection, route templates, MDX styling, posts, CI, public API |

Agents **implement** the package in `mdg-labs/blog`. Consumer repos only **wire and configure** the published npm package.

## Keeping copies up to date

These files are generated from [`README.md`](../README.md), [`packages/blog/templates/README.md`](../packages/blog/templates/README.md), and the package public API. After bumping `@mdg-labs/blog` or changing integration steps, re-copy from `blog/dist/` or diff against the latest versions.

The `blog` repo maintains this folder via rule `.cursor/rules/20-sync-consumer-cursor-artifacts.mdc`.
