# Blog — Workspace Notes

Durable project memory for orchestrator and sub-agents. Transient task notes belong in `.cursor/skills/agent-memory/` (gitignored).

## Current state

- **Spec:** `docs/blog-system-plan.md` (v5)
- **Package:** Phase **0G** verified — **Phase 0 complete**; next consumer **Phase 1** (website)
- **Orchestrator skill:** `.cursor/skills/blog-orchestrator/`
- **Integration branch:** `main`
- **GitHub:** issues only — labels created via `.github/scripts/create-issue-labels.sh`

## Phase status (mirror of plan checkboxes)

| Phase | Status | Commit |
|---|---|---|
| 0A | `[x]` | c560150 |
| 0B | `[x]` | f16d46a |
| 0C | `[x]` | 63c6c30 |
| 0D | `[x]` | c3ecb3e |
| 0E | `[x]` | 361547d |
| 0F | `[x]` | 0ee7dc3 |
| 0G | `[x]` | 2980634 |
| 1 | `[ ]` | — |
| 2 | `[ ]` | — |
| 3 | `[ ]` | — |

## Blockers / decisions

- Phases 2–3 require workspace rule override for slugbase/pipewatch writes
- GitHub Packages publish (0G) before consumers use semver pins

## Last orchestrator run

- **2026-06-23** — Epic #1 complete: #2–#8 verified (0A–0G), 7 commits on `main` (not pushed)
