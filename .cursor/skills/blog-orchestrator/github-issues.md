# Blog — GitHub issues workflow (no project board)

`mdg-labs/blog` uses **issues only** — no Projects v2 board, no GraphQL Status mutations.

| Field | Value |
|---|---|
| Org | `mdg-labs` |
| Repo | `blog` |
| MCP server | `user-github` |
| Default branch | `main` |
| Auto-close | `fixes #N` in commit body when merged to `main` |

## Status labels (workflow)

Labels are **not** auto-created by MCP. Bootstrap once:

```bash
bash .github/scripts/create-issue-labels.sh
```

| Label | Meaning |
|---|---|
| `status/ready` | Spec’d — ready for orchestrator |
| `status/in-progress` | Execution agent working |
| `status/in-review` | Implementation done — awaiting verifier |
| `status/verified` | Verifier PASS — commit on `main` (issue stays **open** until release merge closes it) |

**Transitions:**

```
intake        → status/ready
execution start → remove ready, add in-progress
pre-handoff   → remove in-progress, add in-review
verifier PASS → remove in-review, add verified + PASS comment
verifier FAIL → remove in-progress/in-review, add ready + FAIL comment
```

Use MCP `issue_write` (method: update) with `labels` array — fetch current labels via `issue_read` first, merge add/remove explicitly.

## Area & phase labels (optional but recommended)

| Label | Use |
|---|---|
| `area:package` | `blog/packages/blog` work (Phase 0) |
| `area:consumer` | website / slugbase / pipewatch integration |
| `phase:0A` … `phase:0G` | Maps to `docs/blog-system-plan.md` §8 |
| `phase:1` … `phase:3` | Consumer rollout phases |

## GITHUB SYNC — execution variant

```text
GITHUB SYNC — EXECUTION (issues only):
- MCP server: user-github
- owner: mdg-labs | repo: blog
- issues: #<LEAF> [+ comment on #<PARENT> if subtask]
- FIRST ACTION (before session memory or code):
  - issue_read #<LEAF>
  - issue_write update: remove status/ready if present; ensure status/in-progress
  - add_issue_comment: "Execution started — session <SESSION-ID>"
- LAST ACTIONS (after CI gate, before return):
  - issue_write update: remove status/in-progress; add status/in-review
  - single commit with [#<N>] in subject and fixes #<N> in body
- FORBIDDEN:
  - GraphQL updateProjectV2ItemFieldValue
  - gh project *
  - Closing the issue (verifier/orchestrator never close — fixes #N on main does)
  - status/verified (verifier only)
- REQUIRED OUTPUT:
  - ISSUE STATUS: in-progress (at start)
  - ISSUE STATUS: in-review (at handoff)
```

## GITHUB SYNC — verifier variant

```text
GITHUB SYNC — VERIFIER (issues only):
- issues: #<N>
- ON PASS:
  - add_issue_comment with structured PASS (layers, AC checklist, commit SHA)
  - issue_write update: remove status/in-review; add status/verified
  - REQUIRED OUTPUT: ISSUE STATUS: verified
- ON FAIL:
  - add_issue_comment with FAIL layers
  - issue_write update: remove in-progress/in-review; add status/ready
  - REQUIRED OUTPUT: ISSUE STATUS: ready
- FORBIDDEN: closing issues; GraphQL project mutations
```

## Sub-issues & dependencies

- **Parent/child:** MCP `sub_issue_write` (database IDs via GraphQL `issue { databaseId }` — OK, not project board)
- **Blocked-by:** GraphQL `addBlockedBy` with issue **node** IDs (`id` field) — same as SlugBase intake

## Orchestrator — after verifier PASS

1. Confirm issue has `status/verified` (re-read via MCP; retry label update once if needed).
2. Tick matching plan checkbox `[x]` in `docs/blog-system-plan.md` when phase is mapped.
3. Post short PASS comment if verifier did not.

## Plan phase ↔ issue

Issues should include in body: `**Plan phase:** 0B` (or `phase:0B` label). Orchestrator maps either way.
