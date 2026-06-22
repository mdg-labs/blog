# Blog orchestrator — Sub-agent prompt templates

Copy and fill. Sub-agents do not see the orchestrator chat.

**GitHub mode:** include **GITHUB SYNC** blocks from [github-issues.md](github-issues.md). **ISSUE STATUS FIRST** is the first section of every execution prompt.

**Plan-file mode:** omit GITHUB SYNC when no issue number.

**Every prompt** includes **CI GATE (SHELL)** verbatim.

**No project board** — never paste GraphQL `updateProjectV2ItemFieldValue` or `gh project` commands.

---

## Prompt compression policy

| ❌ Forbidden | ✅ Required |
|---|---|
| `GITHUB SYNC: in-progress → in-review` one-liner | Full GITHUB SYNC block from github-issues.md |
| Board Status / `BOARD STATUS:` | `ISSUE STATUS:` with label names |
| GraphQL project mutations | MCP `issue_write` label updates |
| Skipping CI GATE | CI GATE block verbatim |

### Execution prompt order

**GitHub mode:**

1. **ISSUE STATUS FIRST**
2. **GITHUB SYNC — EXECUTION**
3. MODE / LANE / TASK / SESSION / WORK_ROOT
4. ACCEPTANCE CRITERIA + DOC REFERENCE + scopes
5. **CI GATE (SHELL)**
6. WORK + REQUIRED OUTPUT

**Plan-file mode:** start at step 3 (no GITHUB blocks).

---

## CI GATE (SHELL) — mandatory

```text
CI GATE (SHELL) — MANDATORY:
- NEVER run pnpm, gh, npm, or CI in the default sandbox
- ALWAYS Shell with required_permissions: ["all"] on FIRST attempt

WORK_ROOT:
| Phase | Path |
| 0A–0G | /home/mdguggenbichler/projects/blog |
| 1 | /home/mdguggenbichler/projects/website |
| 2 | /home/mdguggenbichler/projects/slugbase |
| 3 | /home/mdguggenbichler/projects/pipewatch |

Blog repo:
  cd /home/mdguggenbichler/projects/blog && pnpm install && pnpm test && pnpm typecheck

Website (Phase 1+):
  cd /home/mdguggenbichler/projects/website && npm install && npm run check && npm run build

SlugBase marketing (Phase 2+):
  cd /home/mdguggenbichler/projects/slugbase
  bash scripts/with-ci-env.sh pnpm --filter @slugbase/marketing typecheck
  bash scripts/with-ci-env.sh pnpm --filter @slugbase/marketing build

PipeWatch marketing (Phase 3+):
  cd /home/mdguggenbichler/projects/pipewatch
  pnpm --filter @pipewatch/marketing typecheck
  pnpm --filter @pipewatch/marketing build

Use required_permissions: ["all"] for pnpm/npm/gh MCP label updates.
```

---

## GITHUB TOOLS — GitHub mode only

```text
GITHUB TOOLS — MANDATORY:
- MCP server: user-github
- issue_read, issue_write (labels), add_issue_comment
- sub_issue_write for parent links (database IDs via GraphQL issue.databaseId only)

FORBIDDEN:
- gh project item-list / item-edit
- updateProjectV2ItemFieldValue
- gh issue close / reopen during execution or verify
- Creating issues during orchestration (use github-intake skill)
```

---

## ISSUE STATUS FIRST — execution (GitHub mode)

```text
⚠️ ISSUE STATUS FIRST — MANDATORY (before session memory, Read, or code)

Issues: #<LEAF> [parent #<PARENT> — comment only]

1. MCP issue_read #<LEAF>
2. MCP issue_write update #<LEAF>:
   - Remove: status/ready, status/verified (if wrongly present)
   - Add: status/in-progress
3. MCP add_issue_comment: "Execution started — session <SESSION-ID>"

Confirm: ISSUE STATUS: in-progress on #<LEAF>

Pre-handoff (after CI, before return):
- Remove status/in-progress; add status/in-review
- Confirm: ISSUE STATUS: in-review on #<LEAF>
```

---

## Execution agent — GitHub mode, Lane S

```text
⚠️ ISSUE STATUS FIRST — (paste filled block above)

GITHUB SYNC — EXECUTION:
(paste from github-issues.md)

GITHUB TOOLS:
(paste from above)

MODE: GitHub
LANE: S
TASK ID: #<N>
PHASE: <0A|…|3> (from issue label/body)
SESSION ID: #<N>-<YYYYMMDD>-<4hex>
WORK_ROOT: <path — see CI GATE>
WORK BRANCH: main
PARENT: #<parent> | none

CI GATE (SHELL):
(paste)

ACCEPTANCE CRITERIA:
(from issue body — checklist)

DOC REFERENCE:
- spec §8 Phase <PHASE>
- doc-index.md

READ / WRITE SCOPE:
<explicit paths>

SESSION MEMORY: .cursor/skills/agent-memory/active/<SESSION-ID>.md

WORK:
1. ISSUE STATUS FIRST → in-progress
2. Implement per AC
3. CI GATE
4. ISSUE STATUS → in-review → single commit

COMMIT:
  feat(blog)[#<N>]: <summary>

  fixes #<N>

REQUIRED OUTPUT:
- ISSUE STATUS: in-progress (start)
- ISSUE STATUS: in-review (handoff)
- Session ID, commit SHA, CI pass/fail, status: complete | blocked
```

---

## Execution agent — plan-file, Lane S

```text
MODE: plan-file
LANE: S
PHASE: <0A|…|3>
SESSION ID: <PHASE>-<YYYYMMDD>-<4hex>
WORK_ROOT: <path>
WORK BRANCH: main

CI GATE (SHELL):
(paste)

ACCEPTANCE CRITERIA:
(verbatim from docs/blog-system-plan.md §8)

DOC REFERENCE / READ / WRITE SCOPE:
(as needed)

SESSION MEMORY: .cursor/skills/agent-memory/active/<SESSION-ID>.md

WORK:
1. Session memory
2. Implement
3. CI GATE
4. Commit: feat(blog)[<PHASE>]: …

REQUIRED OUTPUT:
- PHASE STATUS: complete | blocked
- commit SHA, CI results
```

---

## Execution agent — Lane P

```text
MODE: plan-file | GitHub
LANE: P
PHASE / TASK: <PHASE> | #<N>
WORK_ROOT: /home/mdguggenbichler/projects/blog-wt-<ID>
WORK BRANCH: orchestrator/<ID>

CI GATE + scopes (disjoint paths only)

WORK:
1. Worktree on orchestrator/<ID> — never commit to main during execution
2. CI from WORK_ROOT
3. Report branch commit SHA

If GitHub: ISSUE STATUS FIRST on #<N> before code
```

---

## Verifier — GitHub mode

```text
GITHUB SYNC — VERIFIER:
(paste from github-issues.md)

GITHUB TOOLS:
(paste)

DISPATCH: readonly MUST be false

MODE: GitHub verify
TASK ID: #<N>
SESSION ID: <same as execution>
WORK_ROOT: <path>
COMMIT: <SHA>

CI GATE (SHELL):
(paste — Layer 2)

VERIFY: Layers 1–3 (scope, CI, AC + fixes #N in commit body)

ON PASS:
- add_issue_comment (structured PASS)
- labels: remove in-review; add verified
- ISSUE STATUS: verified

ON FAIL:
- FAIL comment; labels → status/ready
- ISSUE STATUS: ready

REQUIRED OUTPUT: VERIFICATION PASS|FAIL, ISSUE STATUS, layer details
```

---

## Verifier — plan-file

```text
MODE: plan-file verify
PHASE: <PHASE>
SESSION ID, WORK_ROOT, COMMIT

CI GATE + Layers 1–3 (same logic as GitHub verifier)

ON PASS: VERIFICATION: PASS — orchestrator sets [x] on plan
ON FAIL: VERIFICATION: FAIL — orchestrator sets [!]

readonly: true OK (no MCP needed)
```

---

## Consumer phase hints

(Same as before — Phase 1 website, Phase 2 slugbase, Phase 3 pipewatch.)

See prior sections in this file for WRITE SCOPE templates.

---

## Orchestrator batch snippet

```text
1. List issues with status/ready OR map user #N
2. Check phase deps (0B after 0A verified)
3. OUTPUT batch plan table
4. Dispatch execution → verifier
5. PASS: verified label + plan [x] + next batch
6. Slack session-end
```
