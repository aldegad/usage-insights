# Usage Insights

`usage-insights` is a public Codex skill for turning local AI assistant history into a shareable report and an optional Remotion video.

It bundles a reusable workflow for:

- collecting local usage data from Codex and Claude token ledgers
- collecting Gemini and Antigravity activity traces when token ledgers are unavailable
- generating a written report with project mix, work rhythm, and AI usage patterns
- rendering a polished poster or MP4 from the same analysis

## What This Repo Contains

- [`usage-insights`](./usage-insights): the installable Codex skill
- [`usage-insights/assets/remotion-template`](./usage-insights/assets/remotion-template): the reusable analysis and Remotion project template
- [`usage-insights/scripts/create_project.py`](./usage-insights/scripts/create_project.py): bootstrap script that copies the template into a working folder

## Install

Install the skill from the GitHub subpath:

`aldegad/usage-insights/usage-insights`

Once installed, ask Codex something like:

- `Use $usage-insights to analyze my local AI usage and write a report.`
- `Use $usage-insights to make a shareable AI usage profile and render a video.`

## Data Coverage

- `Codex`: token totals and session data from local Codex state/session files
- `Claude`: token totals when local raw logs are available, plus activity metadata
- `Gemini`: activity traces and project labels from local artifacts
- `Antigravity`: activity traces from local app logs

Right now, Gemini and Antigravity are treated as activity-based providers unless a user has additional local token ledgers available.

## Security

The repo itself is safe to publish because it only contains generic code, documentation, and templates.

Generated outputs are different. A user review is required before sharing:

- `INSIGHTS.md` can expose project names, timelines, and work habits
- rendered posters or videos can expose the same information visually
- raw local logs should never be committed or published

If the goal is a public portfolio artifact, ask Codex to redact or rename sensitive projects before export.

## License

MIT
