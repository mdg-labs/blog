---
name: github-intake
description: Create or enrich mdg-labs/blog GitHub Issues from a feature description, blog-system-plan phase, or user draft. Single issue for small work; Feature (epic) + child Tasks for multi-phase work. Issues-only workflow — no GitHub project board. Stops at status/ready label. Use when the user asks to ticket Phase 0, plan blog rollout, flesh out a draft issue, or create issues from docs/blog-system-plan.md before orchestration.
---

# GitHub intake (`mdg-labs/blog`)

Turn a phase description, spec section, or rough draft into **ready** GitHub issues. Canonical spec: `docs/blog-system-plan.md`.

Templates: [templates.md](templates.md). Orchestrator handoff: [blog-orchestrator/SKILL.md](../blog-orchestrator/SKILL.md). Issue workflow: [blog-orchestrator/github-issues.md](../blog-orchestrator/github-issues.md).

**No project board** — never call `gh project *` or `updateProjectV2ItemFieldValue`.

## When to use

| User intent | Action |
|---|---|
| Roll out **Phase 0** or full plan | **Feature (epic)** + one Task per sub-phase (0A–0G) or grouped |
| Single phase (e.g. "ticket 0B") | **One Task** |
| Consumer integration (1–3) | **One Task** per site (or epic if multi-task) |
| Bug | **One Bug** issue |
| User provides `#N` draft | **Enrich mode** — merge AC, spec refs, labels |
| "Don't create issues" | Draft markdown plan only |

**Ask before creating** if scope, priority, or cross-repo permissions are unclear.

## Repo constants

```text
MCP server: user-github
Owner: mdg-labs
Repo: blog
Spec: docs/blog-system-plan.md
```

## Status & area labels

Intake **creates** issues with:

- `status/ready` — mandatory on every new issue
- `area:package` or `area:consumer`
- `phase:<ID>` when mapped (`phase:0B`, `phase:1`, …)

Do **not** add `status/in-progress`, `status/in-review`, or `status/verified` during intake.

Ensure labels exist before first create (MCP or `gh label create` if missing). See [github-issues.md](../blog-orchestrator/github-issues.md).

## Issue summaries (titles)

| Type | Pattern | Example |
|---|---|---|
| Feature (epic) | `{Scope} — {outcome}` | `Phase 0 — @mdg-labs/blog package` |
| Task | `{Verb} {target}` | `Add blogPostSchema and defineBlogCollection` |
| Bug | `{Area}: {defect}` | `blog-validate: duplicate slug not reported` |

## Dual mode

### Mode A — Create net-new

User describes work with no `#N`.

### Mode B — Enrich existing

Fetch `#N` via MCP `issue_read`, merge sections via `issue_write` (update). Preserve user prose under `## Report` if present. Rewrite vague titles.

## Workflow

### 1. Understand

1. Read relevant sections of `docs/blog-system-plan.md` (cite `spec §N` in bodies).
2. Search codebase under `blog/` and consumer paths if integration is in scope.
3. Duplicate check: MCP `search_issues` (owner: `mdg-labs`, repo: `blog`).
4. Split into **leaf issues** — each independently verifiable with AC from §8.

### 2. Draft plan — STOP. Propose structure first.

```markdown
## Proposed issue structure

**Feature (epic):** #?? — Phase 0 — @mdg-labs/blog package

| # | Phase | Area | Summary | Depends on |
|---|---|---|---|---|
| #?? | 0A | package | Scaffold pnpm workspace | — |
| #?? | 0B | package | Schema and defineBlogCollection | 0A |
| … | | | | |

**Implementation order:** 0A → 0B → … → 0G → Phase 1 …
**Open questions:** …
**Spec refs:** spec §8 Phase 0A–0G
```

**Wait for approval** unless the user said "create the issues now".

### 3. Create Feature epic (Mode A, multi-task only)

```text
MCP issue_write (method: create):
- owner: mdg-labs
- repo: blog
- title: "Phase 0 — @mdg-labs/blog package"
- labels: ["status/ready", "area:package"]
- body: "<epic template — templates.md>"
- assignees: [<from MCP get_me>]
```

Record issue number (e.g. `#1`).

### 4. Create children (Mode A) or enrich (Mode B)

```text
MCP issue_write (method: create):
- owner: mdg-labs
- repo: blog
- title: "Add blogPostSchema and defineBlogCollection"
- labels: ["status/ready", "area:package", "phase:0B"]
- body: "<task template with AC from spec §8 Phase 0B>"
- assignees: [<from get_me>]
```

### 5. Sub-issue relationships (epic + children)

```bash
gh api graphql -f 'query=query { repository(owner:"mdg-labs", name:"blog") {
  parent: issue(number:<PARENT>) { databaseId }
  child: issue(number:<CHILD>) { databaseId }
} }'
```

MCP `sub_issue_write` (method: add).

### 5a. Dependencies (blocked-by)

Use GraphQL `addBlockedBy` with issue **node** IDs (`id`, not `databaseId`) when phase B requires phase A:

```bash
gh api graphql -f 'query=query { repository(owner:"mdg-labs", name:"blog") {
  blocked: issue(number:<BLOCKED>) { id }
  blocking: issue(number:<BLOCKING>) { id }
} }'
```

### 6. Finalize epic body

Update Feature with sub-issues table, suggested order, and spec § refs.

### 7. Finalize — ready (no board)

Each issue must have label `status/ready`. Intake **stops here** — do not set `in-progress` or `verified`.

```text
MCP issue_read — confirm labels include status/ready
```

## Description rules

- **Epic:** background, sub-issues table, order, spec § refs. Children hold implementable AC.
- **Leaf:** plan phase, parent link, depends on, spec refs, AC checklist (from §8), files, tests, CI commands.
- Markdown bodies. No secrets.

## Sizing

| Good leaf | Too big — split |
|---|---|
| One plan sub-phase (0B, 0C, …) | Entire Phase 0 in one issue |
| One consumer site (Phase 1) | All three consumers in one issue |

## After creation — handoff

```markdown
Created on GitHub (issues only — no board):

- Feature: #1 — Phase 0 — @mdg-labs/blog package
- #2 (0A), #3 (0B), …

Order: #2 → #3 → …
Ready: all have `status/ready`

Orchestrator: "implement #3" or "orchestrate Phase 0"
```

## Forbidden

- `gh issue create` — use MCP `issue_write`
- Any `gh project` or Projects v2 GraphQL Status mutation
- `status/in-progress`, `status/in-review`, `status/verified` during intake
- Closing issues during intake
- Creating issues without user approval (unless explicitly asked)
- Inventing API or phases not in `docs/blog-system-plan.md`
- Secrets in issue bodies
- Multi-phase epic without a Feature parent when 2+ tasks
