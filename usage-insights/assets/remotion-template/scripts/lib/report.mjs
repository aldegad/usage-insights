import { writeFileSync } from "node:fs";
import path from "node:path";
import { compactFormatter, OUTPUT_FILE, REPORT_FILE } from "./config.mjs";
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
          ? `저장 대화 ${formatNumber(trace.conversationCount || 0)}개 · 브라우저 기록 ${formatNumber(trace.browserRecordingCount || 0)}개`
          : `앱 로그 세션 ${formatNumber(trace.appSessionCount || 0)}개`;

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

  return `# AI 크리에이터 작업 이력서

Generated: ${insights.generatedAt}
Timezone: ${insights.timezone}

## 데이터 커버리지

- Claude 활동 메타 최초: ${insights.coverage.claudeActivityStart || "-"}
- Claude 첫 토큰 메타: ${insights.coverage.claudeFirstTokenDate || "-"}
- Claude 원시 토큰 로그 최초: ${insights.coverage.claudeRawLogStart || "-"}
- 커버리지 메모: ${
    insights.coverage.claudeHasHistoryBeforeRawLogs
      ? "Claude는 더 이른 활동 흔적이 있지만, 이 머신에 남아 있는 원시 세션/token 로그는 더 늦게 시작합니다."
      : "현재 로컬 기록 기준으로 활동 메타와 원시 토큰 로그가 같은 범위에 있습니다."
  }

## 추가 AI 활동 추적

| Source | Window | Evidence | Note |
| --- | --- | --- | --- |
${activityRows || "| - | - | - | 추가 활동 흔적을 찾지 못했습니다. |"}

## 스냅샷

- 기간: ${insights.period.from} -> ${insights.period.to}
- 활성 일수: ${insights.period.activeDays} / ${insights.period.totalDays}
- 최장 연속 사용: ${insights.period.longestStreak}일
- 전체 기록 수: ${formatNumber(insights.totals.threads)}
- 파싱한 세션 수: ${formatNumber(insights.totals.sessions)}
- 총 토큰: ${formatNumber(insights.totals.tokens)}
- 입력 토큰: ${formatNumber(insights.totals.inputTokens)}
- 컨텍스트 레버리지: ${formatNumber(
    insights.totals.cachedInputTokens + insights.totals.cacheCreationInputTokens,
  )} (${formatPercent(insights.totals.cachedRatio)})
- 출력 토큰: ${formatNumber(insights.totals.outputTokens)}

## 내 해석

- 아키타입: ${insights.persona.archetype}
- 요약: ${insights.persona.summary}
- 가장 잘 맞는 운영법: ${insights.persona.worksBestAs}

## AI 도구 믹스

| Provider | 역할 | 세션 | 비중 | 토큰 | 피크 월 |
| --- | --- | ---: | ---: | ---: | --- |
${providerRows}

## 월별 흐름

| Month | Claude | Codex | Total |
| --- | ---: | ---: | ---: |
${monthlyRows}

## 프로젝트 비중

| Project family | Providers | Records | Share | Tokens |
| --- | --- | ---: | ---: | ---: |
${projectRows}

## 대표 작업 성향

${insights.habits.map((item) => `- ${item}`).join("\n")}

## 잘한 점

${insights.strengths.map((item) => `- ${item}`).join("\n")}

## 조심할 점

${insights.cautions.map((item) => `- ${item}`).join("\n")}

## 질문 스타일

${insights.categories
    .map((category) => `- ${category.label}: ${compactFormatter.format(category.tokens)} tokens`)
    .join("\n")}

## 자주 쓴 도구

${insights.tools.map((tool) => `- ${tool.label}: ${formatNumber(tool.tokens)}회`).join("\n")}

## 반복 키워드

${insights.keywords.map((keyword) => `- ${keyword.label}: ${keyword.tokens}`).join("\n")}

## 대표 세션

| Date | Provider | Repo | Result | Session | Tokens |
| --- | --- | --- | --- | --- | ---: |
${standoutRows}

## Claude에서 특히 잘 끝난 일

| Date | Repo | Result | Helpfulness | Session |
| --- | --- | --- | --- | --- |
${winRows || "| - | - | - | - | - |"}

## Note

- Codex 수치는 로컬 SQLite + session JSONL에서 왔습니다.
- Claude 수치는 로컬 sessions-index + projects JSONL + usage-data facets에서 합쳤습니다.
- Gemini/Antigravity는 로컬 활동 아티팩트와 앱 로그를 근거로 넣었고, 토큰 총합은 확인하지 못했습니다.
- Claude 토큰은 request/message 단위 중복을 제거한 로컬 집계값이며, 공식 청구 수치와 완전히 동일하다고 보장할 수는 없습니다.
- 성향, 강점, 포지셔닝은 정량 데이터 위에 제가 해석을 덧붙인 문장입니다.
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
