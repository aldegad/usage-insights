import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  ANTIGRAVITY_APP_HOME,
  GEMINI_ANTIGRAVITY_HOME,
} from "./config.mjs";
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
    note: "저장 대화와 활동 아티팩트는 남아 있지만, 로컬 토큰 원장은 확인되지 않았습니다.",
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
    note: "앱 로그 세션 기준으로 IDE 사용 흔적이 확인됩니다. 토큰 합계는 별도로 남아 있지 않습니다.",
  };
};
