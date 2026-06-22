# Blog issue description templates

Copy and fill. Reference issues with `#N`. Canonical spec: `docs/blog-system-plan.md`.

## Feature (epic) template

```markdown
## Feature: {title}

**Background:** {Why @mdg-labs/blog exists; link spec §1–§2}.

**Plan phases:** {e.g. 0A–0G | 1–3}

---

### Sub-issues

| Issue | Phase | Area | Description |
|---|---|---|---|
| #XX | 0A | package | {one line} |
| #YY | 0B | package | {one line} |

---

### Goal

{One paragraph: what is true when this epic is done.}

---

### Suggested implementation order

1. **#XX** (0A)
2. **#YY** (0B) — blocked by #XX
3. …

---

### Spec refs

- `docs/blog-system-plan.md` §{N}

Child issues contain acceptance criteria and file paths.
```

## Task template (package phase)

```markdown
## {Title}

**Parent feature:** #XX {epic title}  
**Plan phase:** 0B  
**Depends on:** #YY | —

**Spec refs:** `docs/blog-system-plan.md` §8 Phase 0B, §3.2 exports

---

### Scope

- {bullet tasks from plan table 0B.1, 0B.2, …}

---

### Acceptance criteria

- [ ] {paste verbatim from spec §8 Phase 0B}
- [ ] …

---

### Files (expected)

- `packages/blog/src/schema.ts`
- `packages/blog/src/collection.ts`
- …

---

### Tests / CI

```bash
cd /home/mdguggenbichler/projects/blog
pnpm test
pnpm typecheck
```

---

### Commit hint

`feat(blog)[#N]: {summary}` with `fixes #N` in body.
```

## Task template (consumer phase)

```markdown
## {Title}

**Plan phase:** 1  
**Area:** consumer — `website`  
**Depends on:** #XX (Phase 0F gate) | —

**Spec refs:** `docs/blog-system-plan.md` §8 Phase 1, §6 content paths

---

### Scope

- Wire `@mdg-labs/blog` dependency
- Add `src/content/blog/` + routes from package templates
- …

---

### Acceptance criteria

- [ ] {from spec §8 Phase 1}

---

### Cross-repo note

WORK_ROOT: `/home/mdguggenbichler/projects/website`

---

### Tests / CI

```bash
npm run check && npm run build
```
```

## Bug template

```markdown
## Report

{Original reporter text — preserve on enrich}

---

## {Area}: {defect}

**Spec refs:** …

---

### Reproduction

1. …

---

### Expected / actual

- **Expected:** …
- **Actual:** …

---

### Acceptance criteria

- [ ] …
```
