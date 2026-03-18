import { writeFileSync } from "node:fs";
import path from "node:path";
import { compactFormatter, OUTPUT_FILE, REPORT_FILE } from "./config.mjs";
import { ACTIVITY_COPY, REPORT_COPY } from "./labels.mjs";
import { ensureDir, formatNumber, formatPercent } from "./utils.mjs";

export const renderReport = (insights) => {
  const providerRows = insights.providers
    .map(
      (row) =>
        `| ${row.label} | ${row.role} | ${formatNumber(row.sessions)} | ${formatPercent(
          row.share,
        )} | ${formatNumber(row.tokens)} | ${row.peakMonth || "-"} |`,
    )
    .join("\n");

  const monthlyRows = insights.monthlyByProvider
    .map(
      (row) =>
        `| ${row.label} | ${formatNumber(row.claudeTokens)} | ${formatNumber(
          row.codexTokens,
        )} | ${formatNumber(row.totalTokens)} |`,
    )
    .join("\n");

  const activityRows = insights.activityTraces
    .map((trace) => {
      const evidence =
        trace.label === "Gemini"
          ? ACTIVITY_COPY.geminiEvidence(
              formatNumber(trace.conversationCount || 0),
              formatNumber(trace.browserRecordingCount || 0),
            )
          : ACTIVITY_COPY.antigravityEvidence(formatNumber(trace.appSessionCount || 0));

      return `| ${trace.label} | ${trace.from || "-"} -> ${trace.to || "-"} | ${evidence} | ${trace.note} |`;
    })
    .join("\n");

  const projectRows = insights.projects
    .map(
      (row) =>
        `| ${row.label} | ${row.providers.join(", ")} | ${formatNumber(row.threads)} | ${formatPercent(
          row.tokens / Math.max(insights.totals.tokens, 1),
        )} | ${formatNumber(row.tokens)} |`,
    )
    .join("\n");

  const standoutRows = insights.standoutThreads
    .map(
      (row) =>
        `| ${row.date} | ${row.provider} | ${row.repo} | ${row.outcome} | ${row.title.replace(/\|/gu, "/")} | ${formatNumber(row.tokens)} |`,
    )
    .join("\n");

  const winRows = insights.selectedWins
    .map(
      (row) =>
        `| ${row.date} | ${row.repo} | ${row.outcome} | ${row.helpfulness} | ${row.title.replace(/\|/gu, "/")} |`,
    )
    .join("\n");

  return `# ${REPORT_COPY.title}

Generated: ${insights.generatedAt}
Timezone: ${insights.timezone}

## ${REPORT_COPY.coverageHeading}

- ${REPORT_COPY.claudeActivityStart}: ${insights.coverage.claudeActivityStart || "-"}
- ${REPORT_COPY.claudeFirstTokenDate}: ${insights.coverage.claudeFirstTokenDate || "-"}
- ${REPORT_COPY.claudeRawLogStart}: ${insights.coverage.claudeRawLogStart || "-"}
- ${REPORT_COPY.coverageNote}: ${
    insights.coverage.claudeHasHistoryBeforeRawLogs
      ? REPORT_COPY.coverageNoteEarlier
      : REPORT_COPY.coverageNoteAligned
  }

## ${REPORT_COPY.activityHeading}

| Source | Window | Evidence | Note |
| --- | --- | --- | --- |
${activityRows || `| - | - | - | ${REPORT_COPY.activityEmpty} |`}

## ${REPORT_COPY.snapshotHeading}

- ${REPORT_COPY.period}: ${insights.period.from} -> ${insights.period.to}
- ${REPORT_COPY.activeDays}: ${insights.period.activeDays} / ${insights.period.totalDays}
- ${REPORT_COPY.longestStreak}: ${insights.period.longestStreak}${REPORT_COPY.longestStreakSuffix}
- ${REPORT_COPY.totalRecords}: ${formatNumber(insights.totals.threads)}
- ${REPORT_COPY.parsedSessions}: ${formatNumber(insights.totals.sessions)}
- ${REPORT_COPY.totalTokens}: ${formatNumber(insights.totals.tokens)}
- ${REPORT_COPY.inputTokens}: ${formatNumber(insights.totals.inputTokens)}
- ${REPORT_COPY.contextLeverage}: ${formatNumber(
    insights.totals.cachedInputTokens + insights.totals.cacheCreationInputTokens,
  )} (${formatPercent(insights.totals.cachedRatio)})
- ${REPORT_COPY.outputTokens}: ${formatNumber(insights.totals.outputTokens)}

## ${REPORT_COPY.interpretationHeading}

- ${REPORT_COPY.archetype}: ${insights.persona.archetype}
- ${REPORT_COPY.summary}: ${insights.persona.summary}
- ${REPORT_COPY.worksBestAs}: ${insights.persona.worksBestAs}

## ${REPORT_COPY.toolMixHeading}

| Provider | ${REPORT_COPY.providerRole} | ${REPORT_COPY.sessions} | ${REPORT_COPY.share} | ${REPORT_COPY.tokens} | ${REPORT_COPY.peakMonth} |
| --- | --- | ---: | ---: | ---: | --- |
${providerRows}

## ${REPORT_COPY.monthlyHeading}

| Month | Claude | Codex | Total |
| --- | ---: | ---: | ---: |
${monthlyRows}

## ${REPORT_COPY.projectHeading}

| ${REPORT_COPY.projectFamily} | Providers | ${REPORT_COPY.records} | ${REPORT_COPY.share} | ${REPORT_COPY.tokens} |
| --- | --- | ---: | ---: | ---: |
${projectRows}

## ${REPORT_COPY.habitsHeading}

${insights.habits.map((item) => `- ${item}`).join("\n")}

## ${REPORT_COPY.strengthsHeading}

${insights.strengths.map((item) => `- ${item}`).join("\n")}

## ${REPORT_COPY.cautionsHeading}

${insights.cautions.map((item) => `- ${item}`).join("\n")}

## ${REPORT_COPY.categoriesHeading}

${insights.categories
    .map((category) => `- ${category.label}: ${compactFormatter.format(category.tokens)} tokens`)
    .join("\n")}

## ${REPORT_COPY.toolsHeading}

${insights.tools
    .map((tool) => `- ${tool.label}: ${formatNumber(tool.tokens)}${REPORT_COPY.toolCountSuffix}`)
    .join("\n")}

## ${REPORT_COPY.keywordsHeading}

${insights.keywords.map((keyword) => `- ${keyword.label}: ${keyword.tokens}`).join("\n")}

## ${REPORT_COPY.sessionsHeading}

| Date | Provider | Repo | ${REPORT_COPY.result} | ${REPORT_COPY.session} | ${REPORT_COPY.tokens} |
| --- | --- | --- | --- | --- | ---: |
${standoutRows}

## ${REPORT_COPY.claudeWinsHeading}

| Date | Repo | ${REPORT_COPY.result} | ${REPORT_COPY.helpfulness} | ${REPORT_COPY.session} |
| --- | --- | --- | --- | --- |
${winRows || "| - | - | - | - | - |"}

## ${REPORT_COPY.noteHeading}

- ${REPORT_COPY.note1}
- ${REPORT_COPY.note2}
- ${REPORT_COPY.note3}
- ${REPORT_COPY.note4}
- ${REPORT_COPY.note5}
`;
};

export const writeOutputs = (insights) => {
  ensureDir(path.dirname(OUTPUT_FILE));
  const tsModule = `export const usageInsights = ${JSON.stringify(insights, null, 2)} as const;\n\nexport type UsageInsightsData = typeof usageInsights;\n`;
  writeFileSync(OUTPUT_FILE, tsModule);
  writeFileSync(REPORT_FILE, renderReport(insights));

  const jsonPath = path.join(path.dirname(OUTPUT_FILE), "insights-data.json");
  writeFileSync(jsonPath, JSON.stringify(insights, null, 2));
};
