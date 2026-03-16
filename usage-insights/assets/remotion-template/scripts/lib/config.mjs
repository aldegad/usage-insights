import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
export const CLAUDE_HOME = path.join(os.homedir(), ".claude");
export const GEMINI_HOME = path.join(os.homedir(), ".gemini");
export const GEMINI_ANTIGRAVITY_HOME = path.join(GEMINI_HOME, "antigravity");
export const ANTIGRAVITY_APP_HOME = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "Antigravity",
);
export const OUTPUT_FILE = path.join(PROJECT_ROOT, "src/data/usage-insights.generated.ts");
export const REPORT_FILE = path.join(PROJECT_ROOT, "INSIGHTS.md");
export const TIMEZONE =
  process.env.USAGE_INSIGHTS_TIMEZONE ||
  Intl.DateTimeFormat().resolvedOptions().timeZone ||
  "UTC";

export const CATEGORY_RULES = [
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

export const STOP_WORDS = new Set([
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

export const ALLOWED_ENGLISH_KEYWORDS = new Set([
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

export const OUTCOME_LABELS = {
  fully_achieved: "완료",
  mostly_achieved: "거의 완료",
  partially_achieved: "부분 완료",
  not_achieved: "미완료",
  unknown: "기록 없음",
};

export const HELPFULNESS_LABELS = {
  essential: "핵심 기여",
  very_helpful: "매우 도움됨",
  moderately_helpful: "도움됨",
  slightly_helpful: "약간 도움됨",
  not_helpful: "도움 적음",
  unknown: "기록 없음",
};

export const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const monthFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
});

export const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  hour12: false,
});

export const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  weekday: "short",
});
