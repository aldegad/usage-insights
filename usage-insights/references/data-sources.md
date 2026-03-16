# Data Sources

## Codex

- Reads local state and session data from `~/.codex`
- Supports token totals, thread/session counts, project grouping, and time-based aggregation

## Claude

- Reads local artifacts from `~/.claude`
- Supports token totals when raw local transcript logs are present
- Can still provide activity metadata even when raw token ledgers are incomplete

## Gemini

- Reads local activity artifacts from `~/.gemini/antigravity`
- Currently used for activity traces and project labels
- Token totals should be treated as unavailable unless a real local token ledger is found

## Antigravity

- Reads local app activity from local Antigravity logs
- Currently treated as activity-only unless a token ledger is present

## Important Rule

When a provider does not expose reliable local token totals, keep it in an activity-trace lane instead of mixing it into token charts.
