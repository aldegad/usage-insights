<p align="center">
  <img src="./media/logo.png" alt="Usage Insights logo" width="120" />
</p>

<h1 align="center">usage-insights</h1>

<p align="center">
  Codex skill for analyzing local AI usage and generating reports or optional Remotion videos.
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
  <img src="https://img.shields.io/badge/remotion-video-67c8a1?style=flat-square" alt="Remotion video" />
</p>

## Overview

`usage-insights` packages a reusable Codex skill plus a Remotion-based template project for turning local AI assistant history into:

- a written usage report
- a typed data file for reuse
- an optional poster or MP4

The repository is intended for people who want a repeatable workflow for reviewing how they use Codex, Claude, Gemini, and Antigravity across projects and time periods.

## Install

Install the skill from this GitHub subpath:

`aldegad/usage-insights/usage-insights`

Example prompt after installation:

- `Use $usage-insights to analyze my local AI usage and write a report.`
- `Use $usage-insights to make a shareable AI usage profile and render a video.`

## Quick Start

The repository includes a bootstrap script that creates a reusable workspace from the bundled template:

```bash
python3 usage-insights/scripts/create_project.py --dest ~/usage-insights-project --install
cd ~/usage-insights-project
npm run analyze
npm run dev
npm run render:poster
npm run render:video
```

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

- [`usage-insights`](./usage-insights): installable Codex skill
- [`usage-insights/scripts/create_project.py`](./usage-insights/scripts/create_project.py): workspace bootstrap script
- [`usage-insights/assets/remotion-template`](./usage-insights/assets/remotion-template): analyzer and video template
- [`usage-insights/references`](./usage-insights/references): data-source and security notes
- [`scripts/generate_example_gif.py`](./scripts/generate_example_gif.py): helper for regenerating the example GIF from an MP4

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
