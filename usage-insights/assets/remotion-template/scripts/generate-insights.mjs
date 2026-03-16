import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
const CLAUDE_HOME = path.join(os.homedir(), ".claude");
const GEMINI_HOME = path.join(os.homedir(), ".gemini");
const GEMINI_ANTIGRAVITY_HOME = path.join(GEMINI_HOME, "antigravity");
const ANTIGRAVITY_APP_HOME = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "Antigravity",
);
const OUTPUT_FILE = path.join(PROJECT_ROOT, "src/data/usage-insights.generated.ts");
const REPORT_FILE = path.join(PROJECT_ROOT, "INSIGHTS.md");
const TIMEZONE =
  process.env.USAGE_INSIGHTS_TIMEZONE ||
  Intl.DateTimeFormat().resolvedOptions().timeZone ||
  "UTC";

const CATEGORY_RULES = [
  {
    name: "구조·리뷰",
    patterns: [
      /구조/u,
      /설계/u,
      /검토/u,
      /리뷰/u,
      /review/iu,
      /문서/u,
      /설명/u,
      /분석/u,
      /확인/u,
      /정리/u,
      /why/iu,
      /알려/u,
      /어케/u,
      /어떻게/u,
      /가능/u,
      /architecture/iu,
      /refactor/iu,
      /audit/iu,
      /investigate/iu,
      /summarize/iu,
      /summary/iu,
      /plan/iu,
    ],
  },
  {
    name: "구현·수정",
    patterns: [
      /수정/u,
      /고쳐/u,
      /버그/u,
      /오류/u,
      /에러/u,
      /fix/iu,
      /구현/u,
      /추가/u,
      /배포/u,
      /만들/u,
      /개발/u,
      /실행/u,
      /동기화/u,
      /푸시/u,
      /리팩토링/u,
      /최적화/u,
      /build/iu,
      /lint/iu,
      /add/iu,
      /implement/iu,
      /complete/iu,
      /merge/iu,
      /redesign/iu,
      /update/iu,
      /test/iu,
      /sync/iu,
      /migrate/iu,
    ],
  },
  {
    name: "디자인·프론트",
    patterns: [
      /디자인/u,
      /컬러/u,
      /색상/u,
      /ui/iu,
      /ux/iu,
      /frontend/iu,
      /애니메이션/u,
      /랜딩/u,
      /스타일/u,
      /모달/u,
      /레이어/u,
      /비디오/u,
      /프리뷰/u,
      /키컬러/u,
      /font/iu,
      /motion/iu,
      /remotion/iu,
    ],
  },
  {
    name: "연동·자동화",
    patterns: [
      /연결/u,
      /연동/u,
      /로그인/u,
      /계정/u,
      /oauth/iu,
      /api/iu,
      /automation/iu,
      /agent/iu,
      /threads/iu,
      /firebase/iu,
      /google/iu,
      /mcp/iu,
      /picker/iu,
      /deploy/iu,
    ],
  },
  {
    name: "전략·콘텐츠",
    patterns: [/전략/u, /기획/u, /아이디어/u, /추천/u, /문구/u, /콘텐츠/u, /브랜딩/u],
  },
];

const STOP_WORDS = new Set([
  "이거",
  "이건",
  "그럼",
  "지금",
  "혹시",
  "그거",
  "뭐야",
  "봐줘",
  "해줘",
  "할까",
  "있는",
  "없는",
  "에서",
  "으로",
  "같은",
  "어떻게",
  "되는",
  "하는",
  "한다",
  "좀",
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "what",
  "when",
  "where",
  "have",
  "there",
  "they",
  "your",
  "you",
  "about",
  "code",
  "project",
  "invalid",
  "error",
  "while",
  "intercept",
  "console",
  "unlabeled",
  "computepipeline",
  "computesliceoffsets",
  "was",
  "그리고",
  "현재",
  "있어",
  "오늘",
  "요즘",
  "이해하기",
  "찍기",
  "session",
  "claude",
  "codex",
  "prompt",
]);

const ALLOWED_ENGLISH_KEYWORDS = new Set([
  "threads",
  "firebase",
  "nextjs",
  "google",
  "video",
  "modal",
  "agent",
  "mcp",
  "oauth",
  "ai",
  "ui",
  "ux",
  "plan",
  "remotion",
  "design",
  "build",
]);

const OUTCOME_LABELS = {
  fully_achieved: "완료",
  mostly_achieved: "거의 완료",
  partially_achieved: "부분 완료",
  not_achieved: "미완료",
  unknown: "기록 없음",
};

const HELPFULNESS_LABELS = {
  essential: "핵심 기여",
  very_helpful: "매우 도움됨",
  moderately_helpful: "도움됨",
  slightly_helpful: "약간 도움됨",
  not_helpful: "도움 적음",
  unknown: "기록 없음",
};

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const monthFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
});

const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  hour12: false,
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  weekday: "short",
});

const ensureDir = (dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const toIsoDate = (epochSeconds) => dateFormatter.format(new Date(epochSeconds * 1000));
const toMonth = (epochSeconds) => monthFormatter.format(new Date(epochSeconds * 1000)).slice(0, 7);
const toHour = (epochSeconds) => hourFormatter.format(new Date(epochSeconds * 1000));
const toWeekday = (epochSeconds) => weekdayFormatter.format(new Date(epochSeconds * 1000));

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Math.round(value));
const formatPercent = (value) => `${Math.round(value * 100)}%`;
const sum = (values) => values.reduce((total, value) => total + value, 0);

const median = (values) => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }

  return (sorted[middle - 1] + sorted[middle]) / 2;
};

const normalizeRepo = (cwd) =>
  path
    .basename(cwd || "unknown")
    .replace(/-agent\d+$/u, "")
    .replace(/-legacy$/u, "")
    .replace(/-proto$/u, "");

const walkFiles = (dir, predicate) => {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, predicate));
      continue;
    }

    if (predicate(fullPath, entry)) {
      files.push(fullPath);
    }
  }

  return files;
};

const readJsonFile = (file) => JSON.parse(readFileSync(file, "utf8"));

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const sanitizePrompt = (value) =>
  (value || "")
    .replace(/<ide_opened_file>[\s\S]*?<\/ide_opened_file>/gu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/^No prompt$/iu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const minDate = (values) => {
  const filtered = values.filter((value) => Number.isFinite(value));
  return filtered.length === 0 ? null : Math.min(...filtered);
};

const maxDate = (values) => {
  const filtered = values.filter((value) => Number.isFinite(value));
  return filtered.length === 0 ? null : Math.max(...filtered);
};

const parseStampDate = (value) => {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/u.exec(value || "");

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  return Math.floor(
    new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`).getTime() / 1000,
  );
};

const buildDayStreak = (days) => {
  if (days.length === 0) {
    return 0;
  }

  const sorted = [...new Set(days)].sort();
  let best = 1;
  let current = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = new Date(`${sorted[index - 1]}T00:00:00+09:00`);
    const currentDate = new Date(`${sorted[index]}T00:00:00+09:00`);
    const diff = (currentDate.getTime() - previous.getTime()) / 86_400_000;

    if (diff === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
};

const inferCategory = (title) => {
  const target = title || "";
  let bestCategory = "기타";
  let bestScore = 0;

  for (const category of CATEGORY_RULES) {
    const score = category.patterns.reduce(
      (total, pattern) => total + (pattern.test(target) ? 1 : 0),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category.name;
    }
  }

  return bestCategory;
};

const extractKeywords = (titles) => {
  const counts = new Map();

  for (const title of titles) {
    const koreanTokens = title.match(/[가-힣]{2,8}/gu) || [];
    const englishTokens = (title.match(/[A-Za-z][A-Za-z0-9_-]{1,}/gu) || []).filter((token) =>
      ALLOWED_ENGLISH_KEYWORDS.has(token.toLowerCase()),
    );
    const tokens = [...koreanTokens, ...englishTokens];

    for (const token of tokens) {
      const normalized = token.toLowerCase();

      if (STOP_WORDS.has(normalized)) {
        continue;
      }

      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count]) => ({ label, tokens: count }));
};

const latestStateDb = () => {
  const candidates = readdirSync(CODEX_HOME)
    .filter((name) => /^state_\d+\.sqlite$/u.test(name))
    .map((name) => {
      const fullPath = path.join(CODEX_HOME, name);
      return {
        fullPath,
        mtimeMs: statSync(fullPath).mtimeMs,
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  if (candidates.length === 0) {
    throw new Error(`No state SQLite database found in ${CODEX_HOME}`);
  }

  return candidates[0].fullPath;
};

const queryCodexThreads = () => {
  const dbPath = latestStateDb();
  const sql = `
    SELECT
      id,
      title,
      cwd,
      created_at,
      updated_at,
      tokens_used,
      source,
      model_provider,
      cli_version,
      memory_mode,
      archived
    FROM threads
    ORDER BY created_at ASC
  `;

  const output = execFileSync("sqlite3", ["-json", dbPath, sql], {
    encoding: "utf8",
  });

  return JSON.parse(output);
};

const parseCodexSessions = () => {
  const roots = [
    path.join(CODEX_HOME, "sessions"),
    path.join(CODEX_HOME, "archived_sessions"),
  ];
  const files = roots.flatMap((root) =>
    walkFiles(root, (fullPath, entry) => entry.isFile() && fullPath.endsWith(".jsonl")),
  );
  const sessions = new Map();

  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n").filter(Boolean);
    let meta = null;
    let firstTimestamp = null;
    let lastTimestamp = null;
    let finalUsage = null;
    const toolCounts = new Map();

    for (const line of lines) {
      const parsed = safeJsonParse(line);

      if (!parsed) {
        continue;
      }

      const timestamp = parsed.timestamp ? Date.parse(parsed.timestamp) : null;

      if (timestamp !== null) {
        firstTimestamp = firstTimestamp === null ? timestamp : Math.min(firstTimestamp, timestamp);
        lastTimestamp = lastTimestamp === null ? timestamp : Math.max(lastTimestamp, timestamp);
      }

      if (parsed.type === "session_meta") {
        meta = parsed.payload;
      }

      if (
        parsed.type === "event_msg" &&
        parsed.payload?.type === "token_count" &&
        parsed.payload?.info?.total_token_usage
      ) {
        finalUsage = {
          ...parsed.payload.info.total_token_usage,
          timestamp,
        };
      }

      if (parsed.type === "response_item" && parsed.payload?.type === "function_call") {
        const toolName = parsed.payload.name || "unknown";
        toolCounts.set(toolName, (toolCounts.get(toolName) || 0) + 1);
      }
    }

    const sessionId = meta?.id;

    if (!sessionId) {
      continue;
    }

    sessions.set(sessionId, {
      id: sessionId,
      cwd: meta.cwd || "",
      startedAt: firstTimestamp ? Math.floor(firstTimestamp / 1000) : null,
      endedAt: lastTimestamp ? Math.floor(lastTimestamp / 1000) : null,
      source: meta.source || "",
      cliVersion: meta.cli_version || "",
      finalUsage,
      toolCounts: Object.fromEntries(toolCounts),
      file,
    });
  }

  return sessions;
};

const buildCodexRecords = () => {
  const threads = queryCodexThreads();
  const sessions = parseCodexSessions();

  const records = threads.map((thread) => {
    const session = sessions.get(thread.id);
    const inputTokens = session?.finalUsage?.input_tokens ?? thread.tokens_used ?? 0;
    const cachedInputTokens = session?.finalUsage?.cached_input_tokens ?? 0;
    const outputTokens = session?.finalUsage?.output_tokens ?? 0;
    const totalTokens =
      thread.tokens_used || session?.finalUsage?.total_tokens || inputTokens + cachedInputTokens + outputTokens;
    const createdAt = Number(thread.created_at || 0);

    return {
      id: `codex:${thread.id}`,
      rawId: thread.id,
      provider: "Codex",
      kind: "thread",
      title: sanitizePrompt(thread.title) || "Codex 작업",
      cwd: thread.cwd || session?.cwd || "",
      repo: normalizeRepo(thread.cwd || session?.cwd || ""),
      createdAt,
      updatedAt: Number(thread.updated_at || createdAt || 0),
      tokens: totalTokens,
      inputTokens,
      cachedInputTokens,
      cacheCreationInputTokens: 0,
      outputTokens,
      category: inferCategory(thread.title || ""),
      sessionTools: session?.toolCounts || {},
      metadata: {
        source: thread.source || "",
        cliVersion: thread.cli_version || session?.cliVersion || "",
        modelProvider: thread.model_provider || "",
        archived: Boolean(thread.archived),
      },
    };
  });

  return { records, sessionCount: sessions.size };
};

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
          timestampMs: timestampMs,
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

const parseClaudeCoverage = () => {
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

const scanGeminiActivity = () => {
  if (!existsSync(GEMINI_ANTIGRAVITY_HOME)) {
    return null;
  }

  const allFiles = walkFiles(GEMINI_ANTIGRAVITY_HOME, () => true);

  if (allFiles.length === 0) {
    return null;
  }

  const allMtimes = allFiles.map((file) => statSync(file).mtimeMs);
  const conversationFiles = walkFiles(
    path.join(GEMINI_ANTIGRAVITY_HOME, "conversations"),
    (file) => file.endsWith(".pb"),
  );
  const browserRecordingFiles = walkFiles(
    path.join(GEMINI_ANTIGRAVITY_HOME, "browser_recordings"),
    (file) => path.basename(file) === "metadata.json",
  );
  const taskMetadataFiles = walkFiles(
    path.join(GEMINI_ANTIGRAVITY_HOME, "brain"),
    (file) => path.basename(file) === "task.md.metadata.json",
  );
  const conversationMtimes = conversationFiles.map((file) => statSync(file).mtimeMs);
  const fromMs = minDate(conversationMtimes) ?? minDate(allMtimes);
  const toMs = maxDate(allMtimes);

  return {
    label: "Gemini",
    from: fromMs !== null ? toIsoDate(Math.floor(fromMs / 1000)) : "",
    to: toMs !== null ? toIsoDate(Math.floor(toMs / 1000)) : "",
    conversationCount: conversationFiles.length,
    browserRecordingCount: browserRecordingFiles.length,
    taskArtifactCount: taskMetadataFiles.length,
    note: "저장 대화와 활동 아티팩트는 남아 있지만, 로컬 토큰 원장은 확인되지 않았습니다.",
  };
};

const scanGeminiProjectLabels = () => {
  const activeDir = path.join(GEMINI_ANTIGRAVITY_HOME, "code_tracker", "active");

  if (!existsSync(activeDir)) {
    return new Set();
  }

  return new Set(
    readdirSync(activeDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        if (entry.name === "no_repo") {
          return null;
        }

        return entry.name.replace(/_[0-9a-f]{40}$/iu, "");
      })
      .filter(Boolean),
  );
};

const scanAntigravityActivity = () => {
  const logsDir = path.join(ANTIGRAVITY_APP_HOME, "logs");

  if (!existsSync(logsDir)) {
    return null;
  }

  const sessions = readdirSync(logsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{8}T\d{6}$/u.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (sessions.length === 0) {
    return null;
  }

  const firstSession = parseStampDate(sessions[0]);
  const lastSession = parseStampDate(sessions[sessions.length - 1]);

  return {
    label: "Antigravity",
    from: firstSession !== null ? toIsoDate(firstSession) : "",
    to: lastSession !== null ? toIsoDate(lastSession) : "",
    appSessionCount: sessions.length,
    note: "앱 로그 세션 기준으로 IDE 사용 흔적이 확인됩니다. 토큰 합계는 별도로 남아 있지 않습니다.",
  };
};

const countMapToTopLabel = (countMap) =>
  [...countMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";

const buildClaudeRecords = () => {
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
      const title =
        sanitizePrompt(rawTitle) || `${normalizeRepo(cwd)} 작업 세션`;

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

const dominantProviderForMonth = (row) => {
  const entries = [
    { label: "Codex", value: row.codexTokens || 0 },
    { label: "Claude", value: row.claudeTokens || 0 },
  ].sort((a, b) => b.value - a.value);

  return entries[0]?.value > 0 ? entries[0].label : "";
};

const inferProviderRole = (category) => {
  if (category === "구조·리뷰") {
    return "구조·탐색·리뷰";
  }

  if (category === "구현·수정") {
    return "구현·수정·검증";
  }

  if (category === "디자인·프론트") {
    return "디자인·프론트·모션";
  }

  if (category === "연동·자동화") {
    return "연동·자동화·오케스트레이션";
  }

  return "문제 해결·실험";
};

const labelOutcome = (value) => OUTCOME_LABELS[value] || value || OUTCOME_LABELS.unknown;
const labelHelpfulness = (value) => HELPFULNESS_LABELS[value] || value || HELPFULNESS_LABELS.unknown;

const buildNarrative = (insights) => {
  const topCategory =
    insights.categories.find((category) => category.label !== "기타")?.label ||
    insights.categories[0]?.label ||
    "기타";
  const topProject = insights.projects[0]?.label || "여러 프로젝트";
  const [primaryProvider, secondaryProvider] = insights.providers;
  const providerBlend =
    insights.providers.length > 1 && (secondaryProvider?.share || 0) >= 0.12;
  const firstClaudeLead = insights.monthlyByProvider.find(
    (item) => (item.claudeTokens || 0) > (item.codexTokens || 0),
  );
  const latestCodexLead = [...insights.monthlyByProvider]
    .reverse()
    .find((item) => (item.codexTokens || 0) > (item.claudeTokens || 0));
  const achievedSessions = sum(
    insights.outcomes
      .filter((item) => item.rawLabel === "fully_achieved" || item.rawLabel === "mostly_achieved")
      .map((item) => item.sessions),
  );

  const habits = [];
  const strengths = [];
  const cautions = [];

  if (providerBlend) {
    habits.push(
      "AI를 하나의 비서처럼 밀어붙이기보다, 역할이 다른 팀처럼 운용한다. Claude와 Codex를 작업 단계에 따라 나눠 쓰는 습관이 보인다.",
    );
  }

  if (firstClaudeLead && latestCodexLead && firstClaudeLead.label !== latestCodexLead.label) {
    habits.push(
      `${firstClaudeLead.label}에는 Claude 비중이 앞섰고, ${latestCodexLead.label}에는 Codex가 더 강하다. 도구 선택이 시기별 작업 성격을 따라 움직인다.`,
    );
  }

  if (insights.projects.length >= 4) {
    habits.push(
      "중요 프로젝트를 하나씩 끝내는 타입이면서도, 저장소 사이를 빠르게 오가며 맥락을 이어 붙이는 운영 감각이 있다.",
    );
  }

  if (topCategory === "구조·리뷰") {
    strengths.push(
      "바로 코드를 뽑기보다 구조와 전제를 먼저 정리한다. 그래서 AI를 단순 생성기가 아니라 설계 파트너로 잘 활용한다.",
    );
  }

  if (providerBlend) {
    strengths.push(
      "탐색·정리·리뷰와 구현·실행·렌더를 분리해서 맡길 줄 안다. 이 역할 분담 감각이 AI 네이티브 작업 방식의 큰 강점이다.",
    );
  }

  if (achievedSessions > 0) {
    strengths.push(
      `Claude 기록만 봐도 '완료'와 '거의 완료'로 남은 세션이 ${formatNumber(achievedSessions)}개다. 아이디어를 끝까지 밀어붙이는 완수 감각이 있다.`,
    );
  }

  strengths.push(
    `${topProject}처럼 핵심 프로젝트를 깊게 파고들면서도, 다른 프로젝트로 빠르게 문맥 전환하는 감각이 좋다.`,
  );

  if (insights.totals.megaThreads / Math.max(insights.totals.threads, 1) > 0.28) {
    cautions.push(
      "아주 긴 세션과 스레드 비중이 높다. 복잡한 문제에는 강하지만, 어느 순간부터는 컨텍스트가 너무 커져 판단 속도가 느려질 수 있다.",
    );
  }

  cautions.push(
    "도구가 늘어난 만큼 역할 정의도 더 선명해야 한다. 탐색용, 구현용, 마감용 경계가 흐려지면 오히려 생산성이 분산될 수 있다.",
  );

  if (insights.projects.length >= 5) {
    cautions.push(
      "동시에 붙는 프로젝트 수가 많다. 폭넓음은 장점이지만, 우선순위가 흐려지면 한 세션에서 해결할 범위가 과도하게 커질 수 있다.",
    );
  }

  const archetype = providerBlend
    ? "AI 오퍼레이터"
    : topCategory === "구조·리뷰"
      ? "구조 중심 메이커"
      : topCategory === "디자인·프론트"
        ? "디자인 드리븐 빌더"
        : "실행 지향 메이커";

  const summary = providerBlend
    ? `${insights.period.from}부터 ${insights.period.to}까지의 로컬 기록을 보면, 당신은 AI를 하나의 도구가 아니라 역할이 다른 팀처럼 운영한다. ${firstClaudeLead ? `${firstClaudeLead.label}에는 Claude 비중이 확실히 올라오고, ` : ""}${latestCodexLead ? `${latestCodexLead.label}에는 Codex가 다시 구현 볼륨을 끌어올린다. ` : ""}전체적으로는 ${topProject} 같은 핵심 프로젝트를 중심으로 구조를 잡고, 만들고, 다듬고, 렌더하는 흐름이 선명하다.`
    : `${insights.period.from}부터 ${insights.period.to}까지의 기록을 보면, 당신은 AI를 빠른 생성기로 쓰기보다 ${topCategory} 중심의 작업 파트너로 붙잡는 성향이 강하다. 특히 ${topProject} 같은 핵심 프로젝트를 깊게 파고드는 방식이 선명하다.`;

  const worksBestAs = providerBlend
    ? "탐색·구조화·리뷰는 Claude, 구현·실행·렌더·검증은 Codex처럼 역할을 나눴을 때 가장 강하다."
    : "문제를 넓게 던지기보다, 맥락과 제약을 충분히 싣고 구조 점검 -> 실행 검증 -> 재정리 루프로 가져갈 때 가장 강하다.";

  return { habits, strengths, cautions, archetype, summary, worksBestAs };
};

const buildInsights = () => {
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
  const totalCacheCreationInputTokens = sum(
    records.map((record) => record.cacheCreationInputTokens),
  );
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

  for (let hour = 0; hour < 24; hour += 1) {
    const label = String(hour).padStart(2, "0");
    hourlyMap.set(label, { label, tokens: 0, threads: 0 });
  }

  const weekdayMap = new Map([
    ["Mon", { label: "Mon", tokens: 0, threads: 0 }],
    ["Tue", { label: "Tue", tokens: 0, threads: 0 }],
    ["Wed", { label: "Wed", tokens: 0, threads: 0 }],
    ["Thu", { label: "Thu", tokens: 0, threads: 0 }],
    ["Fri", { label: "Fri", tokens: 0, threads: 0 }],
    ["Sat", { label: "Sat", tokens: 0, threads: 0 }],
    ["Sun", { label: "Sun", tokens: 0, threads: 0 }],
  ]);

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
    monthlyProviderEntry[event.provider === "Codex" ? "codexTokens" : "claudeTokens"] +=
      event.tokens;
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

  const monthly = [...monthlyMap.values()].sort((a, b) => a.label.localeCompare(b.label));
  const monthlyByProvider = [...monthlyByProviderMap.values()].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  const recentDaily = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([, value]) => value);
  const hourly = [...hourlyMap.values()].sort((a, b) => a.label.localeCompare(b.label));
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (label) => weekdayMap.get(label),
  );

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

  const categories = [...categoriesMap.values()]
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 5);

  const tools = [...toolsMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({ label, tokens: count }));

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

  const keywords = extractKeywords(records.map((record) => record.title));
  const standoutThreads = [...records]
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 6)
    .map((record) => ({
      title: record.title.replace(/\s+/gu, " ").slice(0, 120),
      repo: record.repo,
      date: toIsoDate(record.createdAt),
      tokens: record.tokens,
      provider: record.provider,
      outcome:
        record.provider === "Claude" ? labelOutcome(record.metadata.outcome) : "실행 기록",
    }));

  const selectedWins = [...records]
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
    }));

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
    monthly,
    monthlyByProvider,
    recentDaily,
    hourly,
    weekdays,
    projects,
    categories,
    tools,
    keywords,
    standoutThreads,
    outcomes: [...outcomeMap.values()].sort((a, b) => b.sessions - a.sessions),
    helpfulness: [...helpfulnessMap.values()].sort((a, b) => b.sessions - a.sessions),
    selectedWins,
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

const renderReport = (insights) => {
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

const writeOutputs = (insights) => {
  ensureDir(path.dirname(OUTPUT_FILE));
  const tsModule = `export const usageInsights = ${JSON.stringify(insights, null, 2)} as const;\n\nexport type UsageInsightsData = typeof usageInsights;\n`;
  writeFileSync(OUTPUT_FILE, tsModule);
  writeFileSync(REPORT_FILE, renderReport(insights));
};

const main = () => {
  const insights = buildInsights();
  writeOutputs(insights);
  console.log(`Wrote ${OUTPUT_FILE}`);
  console.log(`Wrote ${REPORT_FILE}`);
};

main();
