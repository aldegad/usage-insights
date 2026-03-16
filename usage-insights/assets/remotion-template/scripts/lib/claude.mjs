import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { CLAUDE_HOME } from "./config.mjs";
import {
  inferCategory,
  normalizeRepo,
  readJsonFile,
  safeJsonParse,
  sanitizePrompt,
  walkFiles,
} from "./utils.mjs";

const parseClaudeSessionIndices = () => {
  const indexFiles = walkFiles(
    path.join(CLAUDE_HOME, "projects"),
    (fullPath, entry) => entry.isFile() && entry.name === "sessions-index.json",
  );
  const sessions = new Map();

  for (const file of indexFiles) {
    const data = readJsonFile(file);

    for (const entry of data.entries || []) {
      sessions.set(entry.sessionId, entry);
    }
  }

  return sessions;
};

const parseClaudeFacets = () => {
  const facetFiles = walkFiles(
    path.join(CLAUDE_HOME, "usage-data", "facets"),
    (fullPath, entry) => entry.isFile() && fullPath.endsWith(".json"),
  );
  const facets = new Map();

  for (const file of facetFiles) {
    const data = readJsonFile(file);

    if (!data.session_id) {
      continue;
    }

    facets.set(data.session_id, data);
  }

  return facets;
};

const parseClaudeUsage = () => {
  const jsonlFiles = walkFiles(
    path.join(CLAUDE_HOME, "projects"),
    (fullPath, entry) => entry.isFile() && fullPath.endsWith(".jsonl"),
  );
  const sessions = new Map();
  const requestGroups = new Map();

  for (const file of jsonlFiles) {
    const lines = readFileSync(file, "utf8").split("\n").filter(Boolean);

    for (let index = 0; index < lines.length; index += 1) {
      const parsed = safeJsonParse(lines[index]);

      if (!parsed) {
        continue;
      }

      const sessionId = parsed.sessionId;

      if (!sessionId) {
        continue;
      }

      const timestampMs = parsed.timestamp ? Date.parse(parsed.timestamp) : null;
      const current = sessions.get(sessionId) || {
        sessionId,
        cwd: "",
        gitBranch: "",
        firstTimestamp: null,
        lastTimestamp: null,
        tokens: 0,
        inputTokens: 0,
        cachedInputTokens: 0,
        cacheCreationInputTokens: 0,
        outputTokens: 0,
        toolCounts: new Map(),
        modelCounts: new Map(),
      };

      if (timestampMs !== null) {
        current.firstTimestamp =
          current.firstTimestamp === null ? timestampMs : Math.min(current.firstTimestamp, timestampMs);
        current.lastTimestamp =
          current.lastTimestamp === null ? timestampMs : Math.max(current.lastTimestamp, timestampMs);
      }

      if (!current.cwd && parsed.cwd) {
        current.cwd = parsed.cwd;
      }

      if (!current.gitBranch && parsed.gitBranch) {
        current.gitBranch = parsed.gitBranch;
      }

      if (parsed.type === "assistant" && parsed.message?.usage) {
        const inputTokens = Number(parsed.message.usage.input_tokens || 0);
        const cachedInputTokens = Number(parsed.message.usage.cache_read_input_tokens || 0);
        const cacheCreationInputTokens = Number(
          parsed.message.usage.cache_creation_input_tokens || 0,
        );
        const outputTokens = Number(parsed.message.usage.output_tokens || 0);
        const totalTokens =
          inputTokens + cachedInputTokens + cacheCreationInputTokens + outputTokens;
        const requestKey = `${sessionId}:${parsed.requestId || parsed.message?.id || parsed.uuid || `${file}:${index}`}`;
        const requestGroup = requestGroups.get(requestKey) || {
          sessionId,
          timestampMs,
          latestTimestampMs: timestampMs,
          tokens: 0,
          inputTokens: 0,
          cachedInputTokens: 0,
          cacheCreationInputTokens: 0,
          outputTokens: 0,
          model: parsed.message.model || "unknown",
          toolCounts: new Map(),
          toolIds: new Set(),
        };

        if (timestampMs !== null) {
          requestGroup.latestTimestampMs =
            requestGroup.latestTimestampMs === null
              ? timestampMs
              : Math.max(requestGroup.latestTimestampMs, timestampMs);
        }

        if (totalTokens >= requestGroup.tokens) {
          requestGroup.timestampMs = timestampMs ?? requestGroup.timestampMs;
          requestGroup.tokens = totalTokens;
          requestGroup.inputTokens = inputTokens;
          requestGroup.cachedInputTokens = cachedInputTokens;
          requestGroup.cacheCreationInputTokens = cacheCreationInputTokens;
          requestGroup.outputTokens = outputTokens;
          requestGroup.model = parsed.message.model || requestGroup.model || "unknown";
        }

        for (const item of parsed.message.content || []) {
          if (item.type === "tool_use" && item.name) {
            const toolId = item.id || `${item.name}:${JSON.stringify(item.input || {})}`;

            if (!requestGroup.toolIds.has(toolId)) {
              requestGroup.toolIds.add(toolId);
              requestGroup.toolCounts.set(
                item.name,
                (requestGroup.toolCounts.get(item.name) || 0) + 1,
              );
            }
          }
        }

        requestGroups.set(requestKey, requestGroup);
      }

      sessions.set(sessionId, current);
    }
  }

  const requestEvents = [];

  for (const requestGroup of requestGroups.values()) {
    const current = sessions.get(requestGroup.sessionId) || {
      sessionId: requestGroup.sessionId,
      cwd: "",
      gitBranch: "",
      firstTimestamp: null,
      lastTimestamp: null,
      tokens: 0,
      inputTokens: 0,
      cachedInputTokens: 0,
      cacheCreationInputTokens: 0,
      outputTokens: 0,
      toolCounts: new Map(),
      modelCounts: new Map(),
    };

    current.inputTokens += requestGroup.inputTokens;
    current.cachedInputTokens += requestGroup.cachedInputTokens;
    current.cacheCreationInputTokens += requestGroup.cacheCreationInputTokens;
    current.outputTokens += requestGroup.outputTokens;
    current.tokens += requestGroup.tokens;
    current.modelCounts.set(
      requestGroup.model,
      (current.modelCounts.get(requestGroup.model) || 0) + 1,
    );

    for (const [toolName, count] of requestGroup.toolCounts.entries()) {
      current.toolCounts.set(toolName, (current.toolCounts.get(toolName) || 0) + count);
    }

    sessions.set(requestGroup.sessionId, current);

    if (requestGroup.tokens > 0) {
      requestEvents.push({
        sessionId: requestGroup.sessionId,
        timestampMs:
          requestGroup.latestTimestampMs ??
          requestGroup.timestampMs ??
          current.lastTimestamp ??
          current.firstTimestamp,
        tokens: requestGroup.tokens,
      });
    }
  }

  return { sessions, requestEvents };
};

export const parseClaudeCoverage = () => {
  let historyStartMs = null;
  const historyFile = path.join(CLAUDE_HOME, "history.jsonl");

  if (existsSync(historyFile)) {
    const lines = readFileSync(historyFile, "utf8").split("\n").filter(Boolean);

    for (const line of lines) {
      const parsed = safeJsonParse(line);
      const timestampMs = Number(parsed?.timestamp || 0);

      if (timestampMs > 0) {
        historyStartMs = historyStartMs === null ? timestampMs : Math.min(historyStartMs, timestampMs);
      }
    }
  }

  let firstTokenDateMs = null;
  const settingsFile = path.join(CLAUDE_HOME, "settings.json");

  if (existsSync(settingsFile)) {
    const settings = readJsonFile(settingsFile);
    const timestampMs = Date.parse(settings.claudeCodeFirstTokenDate || "");

    if (!Number.isNaN(timestampMs)) {
      firstTokenDateMs = timestampMs;
    }
  }

  return { historyStartMs, firstTokenDateMs };
};

const countMapToTopLabel = (countMap) =>
  [...countMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";

export const buildClaudeRecords = () => {
  const sessionIndices = parseClaudeSessionIndices();
  const facets = parseClaudeFacets();
  const { sessions: usageBySession, requestEvents } = parseClaudeUsage();
  const allSessionIds = new Set([
    ...sessionIndices.keys(),
    ...facets.keys(),
    ...usageBySession.keys(),
  ]);

  const records = [...allSessionIds]
    .map((sessionId) => {
      const meta = sessionIndices.get(sessionId) || {};
      const facet = facets.get(sessionId) || {};
      const usage = usageBySession.get(sessionId) || {
        cwd: "",
        gitBranch: "",
        firstTimestamp: null,
        lastTimestamp: null,
        tokens: 0,
        inputTokens: 0,
        cachedInputTokens: 0,
        cacheCreationInputTokens: 0,
        outputTokens: 0,
        toolCounts: new Map(),
        modelCounts: new Map(),
      };

      const cwd = meta.projectPath || usage.cwd || "";
      const createdAt = meta.created
        ? Math.floor(Date.parse(meta.created) / 1000)
        : usage.firstTimestamp
          ? Math.floor(usage.firstTimestamp / 1000)
          : 0;
      const updatedAt = meta.modified
        ? Math.floor(Date.parse(meta.modified) / 1000)
        : usage.lastTimestamp
          ? Math.floor(usage.lastTimestamp / 1000)
          : createdAt;
      const rawTitle =
        facet.underlying_goal || facet.brief_summary || sanitizePrompt(meta.firstPrompt) || "";
      const title = sanitizePrompt(rawTitle) || `${normalizeRepo(cwd)} 작업 세션`;

      return {
        id: `claude:${sessionId}`,
        rawId: sessionId,
        provider: "Claude",
        kind: "session",
        title,
        cwd,
        repo: normalizeRepo(cwd),
        createdAt,
        updatedAt,
        tokens: usage.tokens,
        inputTokens: usage.inputTokens,
        cachedInputTokens: usage.cachedInputTokens,
        cacheCreationInputTokens: usage.cacheCreationInputTokens,
        outputTokens: usage.outputTokens,
        category: inferCategory(`${title} ${facet.brief_summary || ""}`),
        sessionTools: Object.fromEntries(usage.toolCounts),
        metadata: {
          messageCount: Number(meta.messageCount || 0),
          gitBranch: meta.gitBranch || usage.gitBranch || "",
          outcome: facet.outcome || "unknown",
          helpfulness: facet.claude_helpfulness || "unknown",
          briefSummary: facet.brief_summary || "",
          primarySuccess: facet.primary_success || "",
          sessionType: facet.session_type || "",
          model: countMapToTopLabel(usage.modelCounts),
        },
      };
    })
    .filter((record) => record.createdAt > 0)
    .sort((a, b) => a.createdAt - b.createdAt);

  return { records, sessionCount: records.length, requestEvents };
};
