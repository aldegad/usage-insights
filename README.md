<p align="center">
  <img src="./media/logo.png" alt="Usage Insights logo" width="120" />
</p>

<h1 align="center">usage-insights</h1>

<p align="center">
  Codex &amp; Claude Code skill for analyzing local AI usage and generating reports or optional Remotion videos.
</p>

<p align="center">
  <a href="./README.md"><strong>English</strong></a>
  ·
  <a href="./README.ko.md"><strong>한국어</strong></a>
</p>

<p align="center">
  <a href="https://github.com/aldegad/usage-insights/releases"><img src="https://img.shields.io/github/v/release/aldegad/usage-insights?style=flat-square" alt="Latest release" /></a>
  <img src="https://img.shields.io/badge/license-MIT-1f7a52?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/codex-skill-ff8d7a?style=flat-square" alt="Codex skill" />
  <img src="https://img.shields.io/badge/claude_code-skill-7c3aed?style=flat-square" alt="Claude Code skill" />
  <img src="https://img.shields.io/badge/remotion-video-67c8a1?style=flat-square" alt="Remotion video" />
</p>

## Overview

`usage-insights` is an installable skill for Codex and Claude Code. When another user installs it, the agent can collect that user's own local AI activity from the current machine and turn it into:

- a written usage report
- a typed data file for reuse
- an optional poster or MP4

The repository is intended for people who want a repeatable workflow for reviewing how they use Codex, Claude, Gemini, and Antigravity across projects and time periods without hand-assembling datasets.

## Install

### Codex

Install the skill from this GitHub subpath:

`aldegad/usage-insights/usage-insights`

Example prompt after installation:

- `Use $usage-insights to analyze my local AI usage and write a report.`
- `Use $usage-insights to generate my usage report, poster, and video.`

### Claude Code

Copy the `usage-insights/` directory into your Claude Code skills folder:

```bash
# Personal (all projects)
cp -r usage-insights ~/.claude/skills/usage-insights

# Project-specific
cp -r usage-insights .claude/skills/usage-insights
```

Example prompt after installation:

- `/usage-insights`
- `Use /usage-insights to generate my usage report, poster, and video.`

## What The Skill Reads

On the machine where the skill is used, the analyzer reads the current user's local data when available:

- `~/.codex`
- `~/.claude`
- `~/.gemini/antigravity`
- local Antigravity app logs

This means another person can install the same skill and generate a report or video from their own local history without editing the analyzer code first.

## Quick Start

For the common case, the skill now ships with a one-command runner:

```bash
python3 usage-insights/scripts/run_usage_insights.py
```

That command will:

- create or reuse `.usage-insights-workspace` in the current directory
- install dependencies when needed
- generate `INSIGHTS.md` and `src/data/usage-insights.generated.ts`
- render both the poster and MP4 by default

If you want a dedicated reusable workspace instead, use the bootstrap flow:

```bash
python3 usage-insights/scripts/create_project.py --dest ~/usage-insights-project --install
cd ~/usage-insights-project
npm run analyze
npm run dev
npm run render:poster
npm run render:video
```

Typical flow:

1. Install the skill.
2. Ask the agent to use the skill (`$usage-insights` in Codex, `/usage-insights` in Claude Code).
3. Let the skill run `run_usage_insights.py` in the current directory.
4. Review the generated `INSIGHTS.md`, poster, and MP4 outputs.
5. Use the dedicated workspace flow only when you want a long-lived project to tweak manually.

## Example Output

![Usage Insights example output](./media/example-output.gif)

## Outputs

The generated workspace produces:

- `INSIGHTS.md`
- `src/data/usage-insights.generated.ts`
- optional poster and MP4 exports under `out/`

## Data Coverage

- `Codex`: token totals, session counts, project grouping
- `Claude`: token totals when raw local logs are available, plus activity metadata
- `Gemini`: activity traces and project labels
- `Antigravity`: activity traces from local app logs

Gemini and Antigravity are intentionally kept out of token charts unless reliable token ledgers are available.

## Repository Layout

- [`usage-insights`](./usage-insights): installable Codex / Claude Code skill
- [`usage-insights/scripts/run_usage_insights.py`](./usage-insights/scripts/run_usage_insights.py): one-command runner for report + poster + video
- [`usage-insights/scripts/create_project.py`](./usage-insights/scripts/create_project.py): workspace bootstrap script
- [`usage-insights/assets/remotion-template`](./usage-insights/assets/remotion-template): analyzer and video template
- [`usage-insights/references`](./usage-insights/references): data-source and security notes
- [`scripts/generate_example_gif.py`](./scripts/generate_example_gif.py): helper for regenerating the example GIF from an MP4

## Distribution Notes

When distributing this repo as a skill:

- share the `usage-insights` subpath, not just the Remotion template
- keep private outputs like `INSIGHTS.md` and generated data outside the published skill payload
- tell users they still need local provider data on their own machine for meaningful analysis

## Security

This repository is safe to publish because it contains generic code, templates, documentation, and sample media.

Generated outputs should still be reviewed before sharing. They may contain:

- project names
- working dates and rhythms
- provider mix and token intensity
- interpretive summaries about habits or workflow

If the final artifact is public-facing, sensitive project names and date ranges should be redacted or generalized first.

## License

MIT
