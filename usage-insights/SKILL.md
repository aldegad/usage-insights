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

When the user invokes this skill without narrowing the request, run the full three-phase pipeline immediately without asking for setup options.

## Workflow

### Phase 1. Collect data

Run the entry script to create or reuse a workspace and collect raw usage data:

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/run_usage_insights.py
```

If the user wants the fixed report/video labels in a specific language, set `USAGE_INSIGHTS_LOCALE` before running the pipeline.

```bash
USAGE_INSIGHTS_LOCALE=en python3 ${CLAUDE_SKILL_DIR}/scripts/run_usage_insights.py
```

This produces:

- `src/data/insights-data.json` — raw statistics with empty narrative fields
- `src/data/usage-insights.generated.ts` — TypeScript data file (narrative fields empty)
- `INSIGHTS.md` — markdown report (narrative sections empty)

The script automatically:

- creates or reuses `.usage-insights-workspace` in the current working directory
- reuses the current directory when it is already a generated usage-insights workspace
- runs `npm install` when dependencies are missing

The analyzer reads from the current user's local home directories when they exist:

- `~/.codex`
- `~/.claude`
- `~/.gemini/antigravity`
- local Antigravity app logs

Do not ask the user to manually assemble those datasets first unless the local source format is missing or broken.

### Phase 2. Write narrative analysis

After Phase 1 completes, read `src/data/insights-data.json` from the workspace. This JSON contains the full usage statistics. Based on this data, **you must write the narrative analysis yourself**.

Do not add or require external API calls for this step. This skill is intended for Codex / Claude Code style agents to read the local analysis data and write the narrative directly in the current conversation flow.

Write the following fields in the **user's conversation language** (match the language the user is speaking). The template's short fixed labels already follow `USAGE_INSIGHTS_LOCALE`; your job is to write the longer narrative fields.

| Field | Type | Guidelines |
|-------|------|------------|
| `persona.archetype` | string | A short label (2-5 words) capturing the user's AI usage style. |
| `persona.summary` | string | 2-3 sentences summarizing overall usage patterns, referencing specific data points (period, top projects, provider mix, token volumes). |
| `persona.worksBestAs` | string | 1 sentence recommending the optimal way to use AI tools based on observed patterns. |
| `habits` | string[] | 3-4 observed usage habits. Each 1-2 sentences. Ground every claim in specific data from the JSON (provider split, monthly trends, project count, session patterns). |
| `strengths` | string[] | 4-5 strengths. Each 1-2 sentences. Reference concrete metrics (completion rates, deep work threads, category focus, project depth). |
| `cautions` | string[] | 2-3 potential risks or areas to watch. Each 1-2 sentences. Base on data patterns (mega thread ratio, simultaneous project count, tool role overlap). |

**Narrative writing rules:**

- Every claim must be grounded in actual data from the JSON. Do not invent or assume patterns that are not supported by the numbers.
- Be specific: reference actual project names, provider names, token counts, date ranges, and percentages from the data.
- Write in a professional but personable tone, as if giving a colleague a constructive usage review.
- Do not use generic filler phrases. Each sentence should carry a concrete observation.

**How to apply the narrative:**

1. Read `src/data/insights-data.json` from the workspace.
2. Compose the narrative fields based on the data.
3. Edit `src/data/usage-insights.generated.ts`:
   - Find the empty `"habits": []` array and replace with your habits array.
   - Find the empty `"strengths": []` array and replace with your strengths array.
   - Find the empty `"cautions": []` array and replace with your cautions array.
   - Find the empty `"persona"` object and replace with your archetype, summary, and worksBestAs.
4. Edit `INSIGHTS.md`:
   - Fill the existing interpretation/persona sections in the generated report.
   - Keep the report language aligned with the selected locale and the user's requested output language.

### Phase 3. Render outputs

After narrative is written, render the requested outputs inside the workspace:

```bash
npm run render:poster    # poster image
npm run render:video     # MP4 video
```

If the user only wants the report, skip this phase. If the user wants both poster and video, run both commands.

The bundled template is designed to work as a draft. The project scene scroll is adaptive: it hides explicit scrollbar UI and adjusts scroll timing based on how many projects are present, so denser archives get a longer read-through.

### Privacy review

Always inspect the generated report before publishing it. Project names, time ranges, work rhythms, and AI usage patterns may be sensitive.

If the user wants a public-facing artifact:

- redact project names when needed
- generalize sensitive metrics or date ranges
- avoid publishing raw local logs or debug artifacts

More detail is in [`references/security.md`](./references/security.md).

## Dedicated workspace

If the user explicitly wants a standalone reusable project, bootstrap one with:

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/create_project.py --dest /desired/workspace/path
```

The bootstrap script copies the bundled Remotion template from [`assets/remotion-template/`](./assets/remotion-template).

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

- [`run_usage_insights.py`](./scripts/run_usage_insights.py): one-command entry point that creates or reuses a workspace and runs data collection
- [`create_project.py`](./scripts/create_project.py): copies the reusable template into a workspace

### references/

- [`data-sources.md`](./references/data-sources.md): provider-by-provider data coverage
- [`security.md`](./references/security.md): what is safe to publish and what should stay local

### assets/

- [`remotion-template/`](./assets/remotion-template): reusable report and video project
