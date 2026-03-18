import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  ANTIGRAVITY_APP_HOME,
  GEMINI_ANTIGRAVITY_HOME,
} from "./config.mjs";
import { ACTIVITY_COPY } from "./labels.mjs";
import {
  maxDate,
  minDate,
  parseStampDate,
  toIsoDate,
  walkFiles,
} from "./utils.mjs";

export const scanGeminiActivity = () => {
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
    note: ACTIVITY_COPY.geminiNote,
  };
};

export const scanGeminiProjectLabels = () => {
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

export const scanAntigravityActivity = () => {
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
    note: ACTIVITY_COPY.antigravityNote,
  };
};
