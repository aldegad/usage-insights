# Usage Insights Template

This template turns local AI usage history into:

- a written report at `INSIGHTS.md`
- a generated data module at `src/data/usage-insights.generated.ts`
- a designed Remotion poster and MP4 under `out/`

Supported local sources:

- `Codex`: token-aware local usage data from `~/.codex`
- `Claude`: token-aware local data when raw logs are available in `~/.claude`
- `Gemini`: activity traces and project labels from `~/.gemini/antigravity`
- `Antigravity`: activity traces from local app logs

## Commands

Install dependencies:

```bash
npm install
```

Regenerate the analysis report and video data:

```bash
npm run analyze
```

Open the Remotion studio preview:

```bash
npm run dev
```

Render the poster frame:

```bash
npm run render:poster
```

Render the MP4:

```bash
npm run render:video
```

Run the full pipeline:

```bash
npm run build:all
```

## Outputs

- `INSIGHTS.md`: narrative report with metrics and interpretive takeaways
- `src/data/insights-data.json`: aggregated analysis data before rendering
- `out/usage-insights-poster.jpg`: cover frame
- `out/usage-insights-profile.mp4`: final animation

## Notes

- Token charts are currently strongest for Codex and Claude.
- Gemini and Antigravity are included as activity traces unless token ledgers are available.
- The persona and habit sections are inference, not exact truth.
- The project archive scene scrolls automatically without a visible scrollbar, and its scroll timing adapts to project count.
- If provider storage formats change later, `scripts/generate-insights.mjs` may need an update.
