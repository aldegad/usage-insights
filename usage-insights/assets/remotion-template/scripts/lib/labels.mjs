const SUPPORTED_LOCALES = new Set(["ko", "en"]);

export const resolveLocale = (value) => {
  const normalized = String(value || "ko").toLowerCase();
  return SUPPORTED_LOCALES.has(normalized) ? normalized : "ko";
};

export const LOCALE = resolveLocale(process.env.USAGE_INSIGHTS_LOCALE);

const CATEGORY_LABELS_BY_LOCALE = {
  ko: {
    structureReview: "구조·리뷰",
    implementation: "구현·수정",
    designFront: "디자인·프론트",
    integration: "연동·자동화",
    strategyContent: "전략·콘텐츠",
    other: "기타",
  },
  en: {
    structureReview: "Structure / Review",
    implementation: "Implementation / Fixes",
    designFront: "Design / Frontend",
    integration: "Integration / Automation",
    strategyContent: "Strategy / Content",
    other: "Other",
  },
};

const PROVIDER_ROLE_LABELS_BY_LOCALE = {
  ko: {
    structureReview: "구조·탐색·리뷰",
    implementation: "구현·수정·검증",
    designFront: "디자인·프론트·모션",
    integration: "연동·자동화·오케스트레이션",
    other: "문제 해결·실험",
  },
  en: {
    structureReview: "Structure / Exploration / Review",
    implementation: "Implementation / Fixes / Validation",
    designFront: "Design / Frontend / Motion",
    integration: "Integration / Automation / Orchestration",
    other: "Problem Solving / Experimentation",
  },
};

const OUTCOME_LABELS_BY_LOCALE = {
  ko: {
    fully_achieved: "완료",
    mostly_achieved: "거의 완료",
    partially_achieved: "부분 완료",
    not_achieved: "미완료",
    unknown: "기록 없음",
    executionLog: "실행 기록",
  },
  en: {
    fully_achieved: "Completed",
    mostly_achieved: "Mostly Completed",
    partially_achieved: "Partially Completed",
    not_achieved: "Not Completed",
    unknown: "No Record",
    executionLog: "Execution Log",
  },
};

const HELPFULNESS_LABELS_BY_LOCALE = {
  ko: {
    essential: "핵심 기여",
    very_helpful: "매우 도움됨",
    moderately_helpful: "도움됨",
    slightly_helpful: "약간 도움됨",
    not_helpful: "도움 적음",
    unknown: "기록 없음",
  },
  en: {
    essential: "Essential",
    very_helpful: "Very Helpful",
    moderately_helpful: "Helpful",
    slightly_helpful: "Slightly Helpful",
    not_helpful: "Not Helpful",
    unknown: "No Record",
  },
};

const ACTIVITY_COPY_BY_LOCALE = {
  ko: {
    geminiNote: "저장 대화와 활동 아티팩트는 남아 있지만, 로컬 토큰 원장은 확인되지 않았습니다.",
    antigravityNote: "앱 로그 세션 기준으로 IDE 사용 흔적이 확인됩니다. 토큰 합계는 별도로 남아 있지 않습니다.",
    geminiEvidence: (conversations, browserRecordings) =>
      `저장 대화 ${conversations}개 · 브라우저 기록 ${browserRecordings}개`,
    antigravityEvidence: (sessions) => `앱 로그 세션 ${sessions}개`,
    codexThreadFallback: "Codex 작업",
    claudeSessionFallback: (repo) => `${repo} 작업 세션`,
  },
  en: {
    geminiNote:
      "Saved conversations and activity artifacts are present, but no local token ledger was found.",
    antigravityNote:
      "IDE usage traces are visible from app log sessions. Aggregate token totals are not stored separately.",
    geminiEvidence: (conversations, browserRecordings) =>
      `${conversations} saved conversations · ${browserRecordings} browser recordings`,
    antigravityEvidence: (sessions) => `${sessions} app log sessions`,
    codexThreadFallback: "Codex Work",
    claudeSessionFallback: (repo) => `${repo} work session`,
  },
};

const REPORT_COPY_BY_LOCALE = {
  ko: {
    title: "AI 크리에이터 작업 이력서",
    coverageHeading: "데이터 커버리지",
    claudeActivityStart: "Claude 활동 메타 최초",
    claudeFirstTokenDate: "Claude 첫 토큰 메타",
    claudeRawLogStart: "Claude 원시 토큰 로그 최초",
    coverageNote: "커버리지 메모",
    coverageNoteEarlier:
      "Claude는 더 이른 활동 흔적이 있지만, 이 머신에 남아 있는 원시 세션/token 로그는 더 늦게 시작합니다.",
    coverageNoteAligned:
      "현재 로컬 기록 기준으로 활동 메타와 원시 토큰 로그가 같은 범위에 있습니다.",
    activityHeading: "추가 AI 활동 추적",
    activityEmpty: "추가 활동 흔적을 찾지 못했습니다.",
    snapshotHeading: "스냅샷",
    period: "기간",
    activeDays: "활성 일수",
    longestStreak: "최장 연속 사용",
    longestStreakSuffix: "일",
    totalRecords: "전체 기록 수",
    parsedSessions: "파싱한 세션 수",
    totalTokens: "총 토큰",
    inputTokens: "입력 토큰",
    contextLeverage: "컨텍스트 레버리지",
    outputTokens: "출력 토큰",
    interpretationHeading: "내 해석",
    archetype: "아키타입",
    summary: "요약",
    worksBestAs: "가장 잘 맞는 운영법",
    toolMixHeading: "AI 도구 믹스",
    providerRole: "역할",
    sessions: "세션",
    share: "비중",
    tokens: "토큰",
    peakMonth: "피크 월",
    monthlyHeading: "월별 흐름",
    projectHeading: "프로젝트 비중",
    projectFamily: "Project family",
    records: "Records",
    habitsHeading: "대표 작업 성향",
    strengthsHeading: "잘한 점",
    cautionsHeading: "조심할 점",
    categoriesHeading: "질문 스타일",
    toolsHeading: "자주 쓴 도구",
    toolCountSuffix: "회",
    keywordsHeading: "반복 키워드",
    sessionsHeading: "대표 세션",
    result: "Result",
    session: "Session",
    claudeWinsHeading: "Claude에서 특히 잘 끝난 일",
    helpfulness: "Helpfulness",
    noteHeading: "Note",
    note1: "Codex 수치는 로컬 SQLite + session JSONL에서 왔습니다.",
    note2: "Claude 수치는 로컬 sessions-index + projects JSONL + usage-data facets에서 합쳤습니다.",
    note3:
      "Gemini/Antigravity는 로컬 활동 아티팩트와 앱 로그를 근거로 넣었고, 토큰 총합은 확인하지 못했습니다.",
    note4:
      "Claude 토큰은 request/message 단위 중복을 제거한 로컬 집계값이며, 공식 청구 수치와 완전히 동일하다고 보장할 수는 없습니다.",
    note5: "성향, 강점, 포지셔닝은 정량 데이터 위에 제가 해석을 덧붙인 문장입니다.",
  },
  en: {
    title: "AI Creator Work Profile",
    coverageHeading: "Data Coverage",
    claudeActivityStart: "Claude activity metadata starts",
    claudeFirstTokenDate: "Claude first token metadata",
    claudeRawLogStart: "Claude raw token logs start",
    coverageNote: "Coverage note",
    coverageNoteEarlier:
      "Claude activity history exists earlier, but the raw local session/token logs on this machine start later.",
    coverageNoteAligned:
      "Based on the current local record, activity metadata and raw token logs cover the same range.",
    activityHeading: "Additional AI Activity",
    activityEmpty: "No additional activity traces were found.",
    snapshotHeading: "Snapshot",
    period: "Period",
    activeDays: "Active days",
    longestStreak: "Longest streak",
    longestStreakSuffix: " days",
    totalRecords: "Total records",
    parsedSessions: "Parsed sessions",
    totalTokens: "Total tokens",
    inputTokens: "Input tokens",
    contextLeverage: "Context leverage",
    outputTokens: "Output tokens",
    interpretationHeading: "Interpretation",
    archetype: "Archetype",
    summary: "Summary",
    worksBestAs: "Works best as",
    toolMixHeading: "AI Tool Mix",
    providerRole: "Role",
    sessions: "Sessions",
    share: "Share",
    tokens: "Tokens",
    peakMonth: "Peak month",
    monthlyHeading: "Monthly Flow",
    projectHeading: "Project Share",
    projectFamily: "Project family",
    records: "Records",
    habitsHeading: "Observed Habits",
    strengthsHeading: "Strengths",
    cautionsHeading: "Cautions",
    categoriesHeading: "Prompt Style",
    toolsHeading: "Most Used Tools",
    toolCountSuffix: " uses",
    keywordsHeading: "Recurring Keywords",
    sessionsHeading: "Standout Sessions",
    result: "Result",
    session: "Session",
    claudeWinsHeading: "Strong Claude Finishes",
    helpfulness: "Helpfulness",
    noteHeading: "Notes",
    note1: "Codex figures come from local SQLite data plus session JSONL logs.",
    note2: "Claude figures combine local sessions-index, projects JSONL, and usage-data facets.",
    note3:
      "Gemini and Antigravity are included from local activity artifacts and app logs, but no aggregate token total was found.",
    note4:
      "Claude token totals are deduplicated from local request/message records and may not exactly match official billing figures.",
    note5:
      "Persona, strengths, and positioning statements are interpretive sentences layered on top of quantitative data.",
  },
};

export const CATEGORY_LABELS = CATEGORY_LABELS_BY_LOCALE[LOCALE];
export const PROVIDER_ROLE_LABELS = PROVIDER_ROLE_LABELS_BY_LOCALE[LOCALE];
export const OUTCOME_LABELS = OUTCOME_LABELS_BY_LOCALE[LOCALE];
export const HELPFULNESS_LABELS = HELPFULNESS_LABELS_BY_LOCALE[LOCALE];
export const ACTIVITY_COPY = ACTIVITY_COPY_BY_LOCALE[LOCALE];
export const REPORT_COPY = REPORT_COPY_BY_LOCALE[LOCALE];
