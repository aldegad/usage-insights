import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import path from "node:path";
import {
  ALLOWED_ENGLISH_KEYWORDS,
  CATEGORY_RULES,
  CATEGORY_LABELS,
  dateFormatter,
  hourFormatter,
  monthFormatter,
  STOP_WORDS,
  weekdayFormatter,
} from "./config.mjs";

export const ensureDir = (dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

export const toIsoDate = (epochSeconds) => dateFormatter.format(new Date(epochSeconds * 1000));
export const toMonth = (epochSeconds) => monthFormatter.format(new Date(epochSeconds * 1000)).slice(0, 7);
export const toHour = (epochSeconds) => hourFormatter.format(new Date(epochSeconds * 1000));
export const toWeekday = (epochSeconds) => weekdayFormatter.format(new Date(epochSeconds * 1000));

export const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Math.round(value));

export const formatPercent = (value) => `${Math.round(value * 100)}%`;
export const sum = (values) => values.reduce((total, value) => total + value, 0);

export const median = (values) => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

export const normalizeRepo = (cwd) =>
  path
    .basename(cwd || "unknown")
    .replace(/-agent\d+$/u, "")
    .replace(/-legacy$/u, "")
    .replace(/-proto$/u, "");

export const walkFiles = (dir, predicate) => {
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

export const readJsonFile = (file) => JSON.parse(readFileSync(file, "utf8"));

export const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const sanitizePrompt = (value) =>
  (value || "")
    .replace(/<ide_opened_file>[\s\S]*?<\/ide_opened_file>/gu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/^No prompt$/iu, " ")
    .replace(/\s+/gu, " ")
    .trim();

export const minDate = (values) => {
  const filtered = values.filter((value) => Number.isFinite(value));
  return filtered.length === 0 ? null : Math.min(...filtered);
};

export const maxDate = (values) => {
  const filtered = values.filter((value) => Number.isFinite(value));
  return filtered.length === 0 ? null : Math.max(...filtered);
};

export const parseStampDate = (value) => {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/u.exec(value || "");

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  return Math.floor(
    new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`).getTime() / 1000,
  );
};

export const buildDayStreak = (days) => {
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

export const inferCategory = (title) => {
  const target = title || "";
  let bestCategory = CATEGORY_LABELS.other;
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

export const extractKeywords = (titles) => {
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
