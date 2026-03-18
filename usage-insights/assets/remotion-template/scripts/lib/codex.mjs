import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { CODEX_HOME } from "./config.mjs";
import { ACTIVITY_COPY } from "./labels.mjs";
import {
  inferCategory,
  normalizeRepo,
  safeJsonParse,
  sanitizePrompt,
  walkFiles,
} from "./utils.mjs";

const latestStateDb = () => {
  const candidates = readdirSync(CODEX_HOME)
    .filter((name) => /^state_\d+\.sqlite$/u.test(name))
    .map((name) => {
      const fullPath = path.join(CODEX_HOME, name);
      return { fullPath, mtimeMs: statSync(fullPath).mtimeMs };
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

export const buildCodexRecords = () => {
  const threads = queryCodexThreads();
  const sessions = parseCodexSessions();
  const records = threads.map((thread) => {
    const session = sessions.get(thread.id);
    const inputTokens = session?.finalUsage?.input_tokens ?? thread.tokens_used ?? 0;
    const cachedInputTokens = session?.finalUsage?.cached_input_tokens ?? 0;
    const outputTokens = session?.finalUsage?.output_tokens ?? 0;
    const totalTokens =
      thread.tokens_used ||
      session?.finalUsage?.total_tokens ||
      inputTokens + cachedInputTokens + outputTokens;
    const createdAt = Number(thread.created_at || 0);

    return {
      id: `codex:${thread.id}`,
      rawId: thread.id,
      provider: "Codex",
      kind: "thread",
      title: sanitizePrompt(thread.title) || ACTIVITY_COPY.codexThreadFallback,
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
