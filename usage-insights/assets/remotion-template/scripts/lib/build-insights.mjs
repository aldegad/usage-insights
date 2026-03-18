import { scanAntigravityActivity, scanGeminiActivity, scanGeminiProjectLabels } from "./activity.mjs";
import { buildClaudeRecords, parseClaudeCoverage } from "./claude.mjs";
import { buildCodexRecords } from "./codex.mjs";
import { LOCALE, TIMEZONE } from "./config.mjs";
import { OUTCOME_LABELS } from "./labels.mjs";
import { buildNarrative, inferProviderRole, labelHelpfulness, labelOutcome } from "./narrative.mjs";
import {
  buildDayStreak,
  extractKeywords,
  formatNumber,
  median,
  sum,
  toHour,
  toIsoDate,
  toMonth,
  toWeekday,
} from "./utils.mjs";

export const buildInsights = () => {
  const codex = buildCodexRecords();
  const claude = buildClaudeRecords();
  const claudeCoverage = parseClaudeCoverage();
  const geminiActivity = scanGeminiActivity();
  const geminiProjectLabels = scanGeminiProjectLabels();
  const antigravityActivity = scanAntigravityActivity();
  const activityTraces = [geminiActivity, antigravityActivity].filter(Boolean);
  const records = [...codex.records, ...claude.records].sort((a, b) => a.createdAt - b.createdAt);
  const timelineEvents = [
    ...codex.records.map((record) => ({
      timestamp: record.createdAt,
      provider: "Codex",
      tokens: record.tokens,
    })),
    ...claude.requestEvents
      .filter((event) => event.timestampMs && event.tokens > 0)
      .map((event) => ({
        timestamp: Math.floor(event.timestampMs / 1000),
        provider: "Claude",
        tokens: event.tokens,
      })),
  ]
    .filter((event) => event.timestamp > 0 && event.tokens > 0)
    .sort((a, b) => a.timestamp - b.timestamp);

  const totalTokens = sum(records.map((record) => record.tokens));
  const totalInputTokens = sum(records.map((record) => record.inputTokens));
  const totalCachedInputTokens = sum(records.map((record) => record.cachedInputTokens));
  const totalCacheCreationInputTokens = sum(records.map((record) => record.cacheCreationInputTokens));
  const totalOutputTokens = sum(records.map((record) => record.outputTokens));
  const totalRecords = records.length;
  const totalSessions = codex.sessionCount + claude.sessionCount;
  const from = Math.min(records[0]?.createdAt ?? Infinity, timelineEvents[0]?.timestamp ?? Infinity);
  const to = Math.max(...records.map((record) => record.updatedAt), from);
  const activeDays = [...new Set(timelineEvents.map((event) => toIsoDate(event.timestamp)))];
  const totalDays =
    Number.isFinite(from) && from > 0 && to
      ? Math.floor((new Date(to * 1000) - new Date(from * 1000)) / 86_400_000) + 1
      : 0;

  const monthlyMap = new Map();
  const monthlyByProviderMap = new Map();
  const dailyMap = new Map();
  const hourlyMap = new Map();
  const weekdayMap = new Map(
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => [
      label,
      { label, tokens: 0, threads: 0 },
    ]),
  );

  for (let hour = 0; hour < 24; hour += 1) {
    const label = String(hour).padStart(2, "0");
    hourlyMap.set(label, { label, tokens: 0, threads: 0 });
  }

  const projectsMap = new Map();
  const categoriesMap = new Map();
  const toolsMap = new Map();
  const providerMap = new Map();
  const outcomeMap = new Map();
  const helpfulnessMap = new Map();

  for (const record of records) {
    const projectEntry = projectsMap.get(record.repo) || {
      label: record.repo,
      tokens: 0,
      threads: 0,
      paths: new Set(),
      providers: new Set(),
    };
    projectEntry.tokens += record.tokens;
    projectEntry.threads += 1;
    projectEntry.paths.add(record.cwd);
    projectEntry.providers.add(record.provider);
    projectsMap.set(record.repo, projectEntry);

    const categoryEntry = categoriesMap.get(record.category) || {
      label: record.category,
      tokens: 0,
      threads: 0,
    };
    categoryEntry.tokens += record.tokens;
    categoryEntry.threads += 1;
    categoriesMap.set(record.category, categoryEntry);

    for (const [toolName, count] of Object.entries(record.sessionTools)) {
      toolsMap.set(toolName, (toolsMap.get(toolName) || 0) + count);
    }

    const providerEntry = providerMap.get(record.provider) || {
      label: record.provider,
      tokens: 0,
      sessions: 0,
      inputTokens: 0,
      cachedInputTokens: 0,
      cacheCreationInputTokens: 0,
      outputTokens: 0,
      paths: new Set(),
      months: new Map(),
      categories: new Map(),
      projects: new Map(),
    };
    providerEntry.tokens += record.tokens;
    providerEntry.sessions += 1;
    providerEntry.inputTokens += record.inputTokens;
    providerEntry.cachedInputTokens += record.cachedInputTokens;
    providerEntry.cacheCreationInputTokens += record.cacheCreationInputTokens;
    providerEntry.outputTokens += record.outputTokens;
    providerEntry.paths.add(record.cwd);
    providerEntry.categories.set(
      record.category,
      (providerEntry.categories.get(record.category) || 0) + record.tokens,
    );
    providerEntry.projects.set(record.repo, (providerEntry.projects.get(record.repo) || 0) + record.tokens);
    providerMap.set(record.provider, providerEntry);

    if (record.provider === "Claude") {
      const outcomeLabel = labelOutcome(record.metadata.outcome);
      outcomeMap.set(outcomeLabel, {
        label: outcomeLabel,
        rawLabel: record.metadata.outcome || "unknown",
        sessions: (outcomeMap.get(outcomeLabel)?.sessions || 0) + 1,
      });

      const helpfulnessLabel = labelHelpfulness(record.metadata.helpfulness);
      helpfulnessMap.set(helpfulnessLabel, {
        label: helpfulnessLabel,
        rawLabel: record.metadata.helpfulness || "unknown",
        sessions: (helpfulnessMap.get(helpfulnessLabel)?.sessions || 0) + 1,
      });
    }
  }

  for (const event of timelineEvents) {
    const month = toMonth(event.timestamp);
    const day = toIsoDate(event.timestamp);
    const hour = toHour(event.timestamp);
    const weekday = toWeekday(event.timestamp);

    const monthlyEntry = monthlyMap.get(month) || { label: month, tokens: 0, threads: 0 };
    monthlyEntry.tokens += event.tokens;
    monthlyEntry.threads += 1;
    monthlyMap.set(month, monthlyEntry);

    const monthlyProviderEntry = monthlyByProviderMap.get(month) || {
      label: month,
      totalTokens: 0,
      codexTokens: 0,
      claudeTokens: 0,
    };
    monthlyProviderEntry.totalTokens += event.tokens;
    monthlyProviderEntry[event.provider === "Codex" ? "codexTokens" : "claudeTokens"] += event.tokens;
    monthlyByProviderMap.set(month, monthlyProviderEntry);

    const dailyEntry = dailyMap.get(day) || { label: day.slice(5), tokens: 0, threads: 0 };
    dailyEntry.tokens += event.tokens;
    dailyEntry.threads += 1;
    dailyMap.set(day, dailyEntry);

    const hourlyEntry = hourlyMap.get(hour) || { label: hour, tokens: 0, threads: 0 };
    hourlyEntry.tokens += event.tokens;
    hourlyEntry.threads += 1;
    hourlyMap.set(hour, hourlyEntry);

    const weekdayEntry = weekdayMap.get(weekday) || { label: weekday, tokens: 0, threads: 0 };
    weekdayEntry.tokens += event.tokens;
    weekdayEntry.threads += 1;
    weekdayMap.set(weekday, weekdayEntry);

    const providerEntry = providerMap.get(event.provider);

    if (providerEntry) {
      providerEntry.months.set(month, (providerEntry.months.get(month) || 0) + event.tokens);
      providerMap.set(event.provider, providerEntry);
    }
  }

  const projects = [...projectsMap.values()]
    .map((entry) => ({
      label: entry.label,
      tokens: entry.tokens,
      threads: entry.threads,
      workspaces: entry.paths.size,
      providers: [
        ...new Set([
          ...entry.providers,
          ...(geminiProjectLabels.has(entry.label) ? ["Gemini"] : []),
        ]),
      ].sort(),
    }))
    .filter((entry) => entry.tokens > 0)
    .sort((a, b) => b.tokens - a.tokens);

  const providers = [...providerMap.values()]
    .map((entry) => {
      const peakMonth = [...entry.months.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
      const topCategory = [...entry.categories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
      const topProject = [...entry.projects.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";

      return {
        label: entry.label,
        tokens: entry.tokens,
        share: totalTokens === 0 ? 0 : entry.tokens / totalTokens,
        sessions: entry.sessions,
        projects: entry.paths.size,
        inputTokens: entry.inputTokens,
        cachedInputTokens: entry.cachedInputTokens,
        cacheCreationInputTokens: entry.cacheCreationInputTokens,
        outputTokens: entry.outputTokens,
        peakMonth,
        topCategory,
        topProject,
        role: inferProviderRole(topCategory),
      };
    })
    .sort((a, b) => b.tokens - a.tokens);

  const claudeActivityStartMs =
    [claudeCoverage.historyStartMs, claudeCoverage.firstTokenDateMs]
      .filter((value) => value !== null)
      .sort((a, b) => a - b)[0] || null;
  const claudeRawLogStartMs =
    claude.requestEvents
      .map((event) => event.timestampMs)
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b)[0] || null;

  const insights = {
    generatedAt: new Date().toISOString(),
    locale: LOCALE,
    timezone: TIMEZONE,
    period: {
      from: Number.isFinite(from) && from > 0 ? toIsoDate(from) : "",
      to: toIsoDate(to),
      activeDays: activeDays.length,
      totalDays,
      longestStreak: buildDayStreak(activeDays),
    },
    totals: {
      threads: totalRecords,
      sessions: totalSessions,
      tokens: totalTokens,
      inputTokens: totalInputTokens,
      cachedInputTokens: totalCachedInputTokens,
      cacheCreationInputTokens: totalCacheCreationInputTokens,
      outputTokens: totalOutputTokens,
      cachedRatio:
        totalInputTokens + totalCachedInputTokens + totalCacheCreationInputTokens === 0
          ? 0
          : (totalCachedInputTokens + totalCacheCreationInputTokens) /
            (totalInputTokens + totalCachedInputTokens + totalCacheCreationInputTokens),
      avgTokensPerThread: totalRecords === 0 ? 0 : totalTokens / totalRecords,
      medianTokensPerThread: median(records.map((record) => record.tokens)),
      deepWorkThreads: records.filter((record) => record.tokens >= 100_000).length,
      megaThreads: records.filter((record) => record.tokens >= 500_000).length,
    },
    coverage: {
      claudeActivityStart:
        claudeActivityStartMs !== null ? toIsoDate(Math.floor(claudeActivityStartMs / 1000)) : "",
      claudeFirstTokenDate:
        claudeCoverage.firstTokenDateMs !== null
          ? toIsoDate(Math.floor(claudeCoverage.firstTokenDateMs / 1000))
          : "",
      claudeRawLogStart:
        claudeRawLogStartMs !== null ? toIsoDate(Math.floor(claudeRawLogStartMs / 1000)) : "",
      claudeHasHistoryBeforeRawLogs:
        claudeActivityStartMs !== null &&
        claudeRawLogStartMs !== null &&
        claudeActivityStartMs < claudeRawLogStartMs,
    },
    activityTraces,
    providers,
    monthly: [...monthlyMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
    monthlyByProvider: [...monthlyByProviderMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
    recentDaily: [...dailyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([, value]) => value),
    hourly: [...hourlyMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) =>
      weekdayMap.get(label),
    ),
    projects,
    categories: [...categoriesMap.values()].sort((a, b) => b.tokens - a.tokens).slice(0, 5),
    tools: [...toolsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({ label, tokens: count })),
    keywords: extractKeywords(records.map((record) => record.title)),
    standoutThreads: [...records]
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 6)
      .map((record) => ({
        title: record.title.replace(/\s+/gu, " ").slice(0, 120),
        repo: record.repo,
        date: toIsoDate(record.createdAt),
        tokens: record.tokens,
        provider: record.provider,
        outcome:
          record.provider === "Claude"
            ? labelOutcome(record.metadata.outcome)
            : OUTCOME_LABELS.executionLog,
      })),
    outcomes: [...outcomeMap.values()].sort((a, b) => b.sessions - a.sessions),
    helpfulness: [...helpfulnessMap.values()].sort((a, b) => b.sessions - a.sessions),
    selectedWins: [...records]
      .filter(
        (record) =>
          record.provider === "Claude" &&
          (record.metadata.outcome === "fully_achieved" ||
            record.metadata.outcome === "mostly_achieved"),
      )
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 5)
      .map((record) => ({
        date: toIsoDate(record.createdAt),
        repo: record.repo,
        title: record.title.replace(/\s+/gu, " ").slice(0, 120),
        tokens: record.tokens,
        outcome: labelOutcome(record.metadata.outcome),
        helpfulness: labelHelpfulness(record.metadata.helpfulness),
      })),
    habits: [],
    strengths: [],
    cautions: [],
    persona: {
      archetype: "",
      summary: "",
      worksBestAs: "",
    },
  };

  const narrative = buildNarrative(insights);
  insights.habits = narrative.habits;
  insights.strengths = narrative.strengths;
  insights.cautions = narrative.cautions;
  insights.persona = {
    archetype: narrative.archetype,
    summary: narrative.summary,
    worksBestAs: narrative.worksBestAs,
  };

  return insights;
};
