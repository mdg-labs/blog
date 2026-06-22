# Blog orchestrator — Slack session-end notifications

## Why sender ≠ recipient

Slack MCP is connected as the **shared service account** so operators get push notifications.

| Role | Account | Slack user ID |
|---|---|---|
| **Sender (MCP auth)** | `cursor@mdg-labs.dev` | `U0BB4FVDUNR` |
| **Recipient (operator DM)** | personal workspace member | see **Default operator** |

Orchestrator **must not** DM the authenticated MCP user when auth is the service account.

## Default operator

| Field | Value |
|---|---|
| Display name | Michael (operator) |
| **user_id** | `U0ARDEK75UJ` |

## Recipient resolution

1. **Run override** — `slack to <email>` or `slack to <user_id>` in orchestrator prompt.
2. **This file** — default `user_id`.
3. **Search fallback** — MCP `slack_search_users` with operator workspace email (not git email).
4. **Skip** — `SLACK_DM: SKIPPED (no operator recipient)`.

## Send

MCP `plugin-slack-slack` → `slack_send_message` with operator `user_id`.

Confirm in chat: `Slack DM sent to <operator name> (from cursor@mdg-labs.dev)` + permalink.
