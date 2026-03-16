---
name: usage-insights
description: Analyze the current user's local AI usage history across Codex, Claude, Gemini, and Antigravity; generate a report, summarize habits and project mix, and optionally render a Remotion poster or video. Use when a user wants a personal AI usage review, a shareable AI creator profile, or a reusable usage-insights workspace driven by machine-local data.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Usage Insights

## Overview

Use this skill when the user wants to turn local AI tool history on the current machine into a structured report and, optionally, a designed poster or MP4.

This skill is best for requests like:

- "Analyze how I've been using Codex and Claude."
- "Make me an AI creator profile from my local history."
- "Turn my usage logs into a shareable report and video."
- "Build a reusable usage-insights project I can rerun later."

## Default behavior

When the user invokes this skill without narrowing the request, do not stop to offer setup options first. Run the bundled entry script immediately:

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/run_usage_insights.py
```

Default script behavior:

- creates or reuses `.usage-insights-workspace` in the current working directory
- reuses the current directory when it is already a generated usage-insights workspace
- runs `npm install` when dependencies are missing
- generates `INSIGHTS.md` plus the generated TypeScript data file
- renders both the poster and MP4 by default

After the script finishes, summarize the generated outputs and call out the workspace path. Review the privacy notes before suggesting the user share any artifact publicly.

## Workflow

### 1. Run the automatic pipeline

Use the entry script for the common case:

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/run_usage_insights.py
```

This is the preferred path for:

- analyze + poster + video in one run
- users who do not care about workspace setup details
- repeated calls from arbitrary repositories or folders

Useful variants:

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/run_usage_insights.py --mode report
python3 ${CLAUDE_SKILL_DIR}/scripts/run_usage_insights.py --mode poster
python3 ${CLAUDE_SKILL_DIR}/scripts/run_usage_insights.py --mode video
python3 ${CLAUDE_SKILL_DIR}/scripts/run_usage_insights.py --mode dev
```

### 2. Create or reuse a dedicated workspace

If the user explicitly wants a standalone reusable project, bootstrap one with:

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/create_project.py --dest /desired/workspace/path
```

The bootstrap script copies the bundled Remotion template from [`assets/remotion-template/`](./assets/remotion-template).

### 3. Install dependencies

Inside the generated workspace:

```bash
npm install
```

The automatic runner handles this step on its own unless `node_modules` is already present.

### 4. Generate the analysis

Run:

```bash
npm run analyze
```

This produces:

- `INSIGHTS.md`
- `src/data/usage-insights.generated.ts`

The analyzer reads from the current user's local home directories when they exist:

- `~/.codex`
- `~/.claude`
- `~/.gemini/antigravity`
- local Antigravity app logs

Do not ask the user to manually assemble those datasets first unless the local source format is missing or broken.

### 5. Review privacy before sharing

Always inspect the generated report before publishing it. Project names, time ranges, work rhythms, and AI usage patterns may be sensitive.

If the user wants a public-facing artifact:

- redact project names when needed
- generalize sensitive metrics or date ranges
- avoid publishing raw local logs or debug artifacts

More detail is in [`references/security.md`](./references/security.md).

### 6. Render poster or video when requested

Open the Remotion studio:

```bash
npm run dev
```

Render a poster:

```bash
npm run render:poster
```

Render an MP4:

```bash
npm run render:video
```

The bundled template is designed to work as a draft. After analysis, update copy, tone, language, and visual emphasis to match the user's intended audience before final export.

If the user only wants the report, use `--mode report` or stop after `npm run analyze`. If the user wants a visual artifact, continue into Remotion preview or render commands.

The default project scene scroll is adaptive: it hides explicit scrollbar UI and adjusts scroll timing based on how many projects are present, so denser archives get a longer read-through.

## Data Coverage

Supported sources are summarized in [`references/data-sources.md`](./references/data-sources.md).

Current behavior:

- `Codex`: token-aware
- `Claude`: token-aware when raw local logs are present
- `Gemini`: activity-aware, plus project labels when local artifacts exist
- `Antigravity`: activity-aware

Do not fabricate token counts for providers that only expose activity traces.

## Resources

### scripts/

- [`run_usage_insights.py`](./scripts/run_usage_insights.py): one-command entry point that creates or reuses a workspace and runs the requested pipeline
- [`create_project.py`](./scripts/create_project.py): copies the reusable template into a workspace

### references/

- [`data-sources.md`](./references/data-sources.md): provider-by-provider data coverage
- [`security.md`](./references/security.md): what is safe to publish and what should stay local

### assets/

- [`remotion-template/`](./assets/remotion-template): reusable report and video project
