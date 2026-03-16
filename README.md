<p align="center">
  <img src="./media/banner.png" alt="Usage Insights banner" width="100%" />
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

`usage-insights` is a public Codex skill for turning local AI assistant history into a written report and an optional Remotion poster or MP4.

It is designed for people who want to answer questions like:

- How much did I use Codex, Claude, Gemini, or Antigravity?
- Which projects absorbed most of my AI time?
- What kind of AI operator am I becoming?
- Can I turn this into a shareable creator profile?

## Example Output

![Usage Insights example output](./media/example-output.gif)

## What It Does

- Collects token-aware usage from local Codex and Claude artifacts
- Collects activity traces from Gemini and Antigravity when token ledgers are unavailable
- Groups work by project, time range, day rhythm, and provider mix
- Generates `INSIGHTS.md` plus a typed data module for rendering
- Exports a polished Remotion poster or MP4 from the same analysis

## Install

Install the skill from this GitHub subpath:

`aldegad/usage-insights/usage-insights`

Then prompt Codex with something like:

- `Use $usage-insights to analyze my local AI usage and write a report.`
- `Use $usage-insights to make a shareable AI usage profile and render a video.`

## Quick Start

The bundled skill can bootstrap a reusable workspace:

```bash
python3 usage-insights/scripts/create_project.py --dest ~/usage-insights-project --install
cd ~/usage-insights-project
npm run analyze
npm run dev
npm run render:poster
npm run render:video
```

## Repository Layout

- [`usage-insights`](./usage-insights): installable Codex skill
- [`usage-insights/scripts/create_project.py`](./usage-insights/scripts/create_project.py): workspace bootstrap script
- [`usage-insights/assets/remotion-template`](./usage-insights/assets/remotion-template): reusable analyzer + Remotion template
- [`usage-insights/references`](./usage-insights/references): security and data-source notes

## Data Coverage

- `Codex`: token totals, session counts, project grouping
- `Claude`: token totals when raw local logs exist, plus activity metadata
- `Gemini`: activity traces and project labels
- `Antigravity`: activity traces from local app logs

Gemini and Antigravity are intentionally separated from token charts unless reliable token ledgers exist. The skill avoids inventing totals for providers that only expose activity traces.

## Security

The repository itself is safe to publish because it contains generic code, templates, references, and sample data.

Generated outputs are not automatically safe to publish. Review these before sharing:

- `INSIGHTS.md`
- `src/data/usage-insights.generated.ts`
- exported posters and MP4s

They may expose project names, working periods, usage intensity, and habits. If the final artifact is public-facing, ask Codex to redact or rename sensitive projects first.

## Yes, It Can Render Video

Yes. The template supports:

- report generation
- Remotion studio preview
- poster export
- MP4 export

## License

MIT
