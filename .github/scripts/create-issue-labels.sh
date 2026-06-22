#!/usr/bin/env bash
# Create GitHub issue labels for mdg-labs/blog workflow (issues-only — no project board).
# Idempotent: skips labels that already exist.
set -euo pipefail

REPO="${REPO:-mdg-labs/blog}"

create_label() {
  local name="$1"
  local color="$2"
  local description="$3"
  if gh label list --repo "$REPO" --search "$name" --json name --jq ".[] | select(.name == \"$name\") | .name" | grep -qxF "$name"; then
    echo "skip: $name (exists)"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$description"
    echo "created: $name"
  fi
}

echo "Creating workflow labels on $REPO …"

# Status (mutually exclusive workflow states)
create_label "status/ready"        "1D76DB" "Spec'd — ready for orchestrator"
create_label "status/in-progress"  "FBCA04" "Execution agent working"
create_label "status/in-review"    "D93F0B" "Implementation done — awaiting verifier"
create_label "status/verified"     "0E8A16" "Verifier PASS — open until fixes #N on main"

# Area
create_label "area:package"   "7057FF" "blog/packages/blog — Phase 0"
create_label "area:consumer"  "C5DEF5" "website / slugbase / pipewatch integration"

# Plan phases (docs/blog-system-plan.md §8)
for phase in 0A 0B 0C 0D 0E 0F 0G; do
  create_label "phase:${phase}" "BFD4F2" "Plan phase ${phase}"
done
for phase in 1 2 3; do
  create_label "phase:${phase}" "BFD4F2" "Consumer rollout phase ${phase}"
done

echo "Done."
