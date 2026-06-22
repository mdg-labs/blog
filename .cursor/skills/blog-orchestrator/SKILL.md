---
name: blog-orchestrator
description: Run a chat as a pure orchestrator for the mdg-labs/blog repository and @mdg-labs/blog rollout. Reads docs/blog-system-plan.md and GitHub issues (#N), presents a batch plan, dispatches sub-agents immediately unless the user says wait. Tracks work via issue labels (no project board). Verifies each phase and syncs plan checkboxes. Sends a session-end Slack DM when the run completes. Use when the user asks to orchestrate the blog package, implement #N or Phase 0, or roll out blog to website/slugbase/pipewatch.
---

# Blog orchestrator (`mdg-labs/blog`)

The main agent in this chat is a **dispatcher only**. It reads **`docs/blog-system-plan.md`** and/or **GitHub issues**, decides the next batch, and hands implementation to sub-agents.

## Workspace

| Item | Value |
|---|---|
| Package repo | `/home/mdguggenbichler/projects/blog` |
| Spec | `docs/blog-system-plan.md` |
| Integration branch | `main` |
| Task branch (Lane P) | `orchestrator/<PHASE-ID>` |
| Consumer sites | `website/`, `slugbase/packages/marketing/`, `pipewatch/apps/marketing/` |
| Workspace memory | `.cursor/skills/workspace-notes.md` |
| Session memory | `.cursor/skills/agent-memory/active/<SESSION-ID>.md` — **gitignored** |
| Prompt templates | [prompt-templates.md](prompt-templates.md) |
| Doc index | [doc-index.md](doc-index.md) |
| GitHub issues workflow | [github-issues.md](github-issues.md) |
| Intake skill | [github-intake/SKILL.md](../github-intake/SKILL.md) |
| Slack session-end | [slack-session-end.md](slack-session-end.md) |

**No GitHub project board** — status via issue labels only (`status/ready` → `in-progress` → `in-review` → `verified`).

---

## What the orchestrator does (and does not do)

### MAY do

- Read **`docs/blog-system-plan.md`** and **GitHub issues** via MCP
- Read [doc-index.md](doc-index.md), [prompt-templates.md](prompt-templates.md), [github-issues.md](github-issues.md), [slack-session-end.md](slack-session-end.md)
- Read/write `.cursor/skills/workspace-notes.md`
- Edit plan checkboxes in `docs/blog-system-plan.md` (mirror of verified work)
- Launch sub-agents via **Task** tool
- **Issue label sync** after verifier PASS — see [github-issues.md](github-issues.md)
- Session-end Slack DM

### MUST NOT do

- Read implementation files, diffs, test output, or logs
- Use `Read` / `Grep` / `Glob` / `Shell` / `ApplyPatch` on implementation work
- Paste full spec sections into sub-agent prompts
- Use `gh project *` or Projects v2 GraphQL Status mutations
- Close issues manually (only `fixes #N` on merge to `main` closes them)
- Push unless the user explicitly asks

---

## Modes

| Mode | When | Tracking |
|---|---|---|
| **GitHub** (preferred when issues exist) | User names `#N`, URL, or intake created issues | Issue labels + comments |
| **Plan-file** | No issues yet; user says "Phase 0A" | Spec checkboxes only |
| **Chat** | Ad-hoc, no phase/issue | `TodoWrite` |

`implement #12` → GitHub mode. `orchestrate Phase 0` with open issues → GitHub mode mapped by `phase:*` labels.

---

## Default: plan first, then dispatch

Start immediately unless user said `plan only`, `wait`, or `don't start`.

1. Read plan file + open issues (`status/ready` queue) + dependencies.
2. Build [batch plan](#batch-plan-format).
3. **Show plan** before first `Task`.
4. **Dispatch batch 1** in the same turn.

### Batch plan format

```markdown
## Blog orchestrator plan — <target>

**Mode:** GitHub | plan-file | chat  
**Lane:** S (default) | P  
**Tracking:** issue labels (no board)

| Batch | Lane | Issue / Phase | Repo | Notes |
|---|---|---|---|---|
| 1 | S | #3 / 0B | blog | after #2 verified |
| … | | | | |

**Skipped:** #2 verified  
**Blocked:** —  

→ Starting batch 1…
```

### Phase dependencies

```
0A → 0B → 0C → 0D → 0E → 0F → 0G → 1 → 2 → 3
```

Phase **1** requires **0F** gate. **0G** recommended before semver consumer pins.

---

## Cross-repo phases (1–3)

| Phase | WORK_ROOT | Default workspace edits |
|---|---|---|
| 1 | `/home/mdguggenbichler/projects/website` | Yes |
| 2 | `/home/mdguggenbichler/projects/slugbase` | Read-only — operator override |
| 3 | `/home/mdguggenbichler/projects/pipewatch` | Read-only — operator override |

---

## Issue status ownership (GitHub mode)

| Label | Who sets it |
|---|---|
| `status/ready` | Intake only |
| `status/in-progress` | **Execution** — first action |
| `status/in-review` | **Execution** — pre-handoff |
| `status/verified` | **Verifier** on PASS; orchestrator confirms |

**Orchestrator after verifier PASS:**

1. Confirm `status/verified` on leaf issue (retry label update once).
2. Tick plan checkbox `[x]` when phase mapped.
3. Next batch.

**Verifier:** `readonly: false` when GitHub mode (needs MCP label updates).

On FAIL: execution/verifier restores `status/ready`.

---

## Dispatching sub-agents

See [prompt-templates.md](prompt-templates.md). Every GitHub prompt includes **GITHUB SYNC** from [github-issues.md](github-issues.md).

1. **ISSUE STATUS FIRST** (GitHub) — label → `in-progress` before code
2. **PHASE** / **#N**
3. **WORK_ROOT**
4. **Acceptance criteria** — from issue body or spec §8
5. **DOC REFERENCE** — [doc-index.md](doc-index.md)
6. **READ / WRITE scope**
7. **CI GATE**

**Execution output:** `ISSUE STATUS: in-progress` / `in-review`  
**Verifier output:** `ISSUE STATUS: verified` | `ready`

---

## Commits

```
feat(blog)[#12]: add blogPostSchema and defineBlogCollection

fixes #12
```

Plan-file only (no issue yet): `feat(blog)[0B]: …`

Never `git add .`. Never commit session memory.

---

## Verification (three layers)

**Layer 1** — Scope vs WRITE SCOPE  
**Layer 2** — CI from [doc-index.md](doc-index.md)  
**Layer 3** — AC from issue/spec; no Velite/`next-mdx-remote`; `fixes #N` when GitHub mode

| Result | Plan | Issue |
|---|---|---|
| PASS | `[x]` | `status/verified` + comment |
| FAIL | `[!]` | `status/ready` + FAIL comment |

---

## Session-end Slack

Per [slack-session-end.md](slack-session-end.md). Skip if `no slack`.

---

## Plan file markers (secondary)

| Marker | Meaning |
|---|---|
| `- [ ]` | Not started |
| `- [~]` | In progress |
| `- [x]` | Verifier PASS |
| `- [!]` | FAIL |

---

## Run loop

1. Read workspace-notes + spec + ready issues.
2. Batch plan → execution → verifier.
3. PASS → verified label + `[x]` → next batch.
4. Slack DM + chat summary.

---

## Anti-patterns

- Projects board / GraphQL Status mutations
- Closing issues before merge to `main`
- Dispatch before batch plan
- Phase **1** before **0F** passes
- Verifier `readonly: true` in GitHub mode
- `git add .`
- Velite or duplicate MDX pipelines in blog package
- Cross-repo Phase 2/3 without noting workspace constraints
