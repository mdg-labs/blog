# @mdg-labs/blog

Shared Astro blog infrastructure for MDG Labs marketing sites (roof, SlugBase, PipeWatch).

**Specification and implementation phases:** [`docs/blog-system-plan.md`](docs/blog-system-plan.md)

## Status

Package scaffold not started — follow **Phase 0A** in the spec.

## Local development

```bash
pnpm install
pnpm test
pnpm typecheck
```

Consumers link locally via `"@mdg-labs/blog": "file:../../../blog/packages/blog"` until `0.1.0` is published to GitHub Packages.
