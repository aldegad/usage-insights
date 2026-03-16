---
name: usage-insights
description: Analyze local AI usage history across Codex, Claude, Gemini, and Antigravity; generate a report, summarize habits and project mix, and optionally render a Remotion poster or video. Use when a user wants a personal AI usage review, a shareable AI creator profile, or a reusable usage-insights workspace.
---

# Usage Insights

## Overview

Use this skill when the user wants to turn local AI tool history into a structured report and, optionally, a designed poster or MP4.

This skill is best for requests like:

- "Analyze how I've been using Codex and Claude."
- "Make me an AI creator profile from my local history."
- "Turn my usage logs into a shareable report and video."
- "Build a reusable usage-insights project I can rerun later."

## Workflow

### 1. Create or reuse a workspace

If the user does not already have a dedicated usage-insights project, bootstrap one with:

```bash
python3 /path/to/usage-insights/scripts/create_project.py --dest /desired/workspace/path
```

The bootstrap script copies the bundled Remotion template from [`assets/remotion-template/`](./assets/remotion-template).

### 2. Install dependencies

Inside the generated workspace:

```bash
npm install
```

### 3. Generate the analysis

Run:

```bash
npm run analyze
```

This produces:

- `INSIGHTS.md`
- `src/data/usage-insights.generated.ts`

### 4. Review privacy before sharing

Always inspect the generated report before publishing it. Project names, time ranges, work rhythms, and AI usage patterns may be sensitive.

If the user wants a public-facing artifact:

- redact project names when needed
- generalize sensitive metrics or date ranges
- avoid publishing raw local logs or debug artifacts

More detail is in [`references/security.md`](./references/security.md).

### 5. Render poster or video when requested

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

- [`create_project.py`](./scripts/create_project.py): copies the reusable template into a workspace

### references/

- [`data-sources.md`](./references/data-sources.md): provider-by-provider data coverage
- [`security.md`](./references/security.md): what is safe to publish and what should stay local

### assets/

- [`remotion-template/`](./assets/remotion-template): reusable report and video project
