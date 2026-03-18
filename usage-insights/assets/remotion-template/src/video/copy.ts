import type { UsageInsightsData } from "../data/usage-insights.generated";

export type SupportedLocale = "ko" | "en";

export const resolveVideoLocale = (locale?: string): SupportedLocale =>
  locale === "en" ? "en" : "ko";

type VideoCopy = {
  masthead: {
    title: string;
    navLabels: Record<string, string>;
    synced: string;
  };
  opening: {
    section: string;
    tokenChip: string;
    activityChip: (labels: string[]) => string;
    titleLines: [string, string];
    summary: (data: UsageInsightsData) => string;
    metricTitles: {
      totalTokens: string;
      activeDays: string;
      longestStreak: string;
      threads: string;
    };
  };
  system: {
    section: string;
    monthlyTitle: string;
    monthlySubtitleDual: (claudeLabel: string, codexLabel: string) => string;
    monthlySubtitleSingle: string;
    monthlyChips: {
      total: string;
      codex: string;
      claude: string;
    };
    providerMixTitle: string;
    providerMixNoteDual: (claudeLabel: string, codexLabel: string) => string;
    providerMixNoteSingle: string;
    providerTokens: (role: string, tokens: string) => string;
    recentDailyTitle: string;
    recentDailySubtitle: string;
    monthlyTotalTokens: (tokens: string) => string;
  };
  rhythm: {
    section: string;
    title: string;
    subtitle: string;
    peakTimes: string;
    strongDays: string;
    interpretation: string;
    interpretationBody: string;
    hourChip: (hour: string, tokens: string) => string;
    weekdayChip: (day: string, tokens: string) => string;
  };
  persona: {
    section: string;
    badge: string;
    habits: string;
    strengths: string;
    cautions: string;
    tendency: string;
    extraActivity: string;
    activityFootnote: string;
  };
  projects: {
    section: string;
    totalProjects: (count: number) => string;
    topProject: (label: string, tokens: string) => string;
    multiTool: (count: number) => string;
    workspaceSuffix: string;
    records: (count: number) => string;
    share: (percent: string) => string;
  };
  closing: {
    section: string;
    deepWorkChip: (count: string) => string;
    headlineLines: [string, string];
    summary: (data: UsageInsightsData, totalTokens: string) => string;
    readPattern: string;
    toolPlacement: string;
    focusMode: string;
    projectAxis: string;
    toolPlacementBody: (data: UsageInsightsData) => string;
    focusModeBody: (data: UsageInsightsData) => string;
    projectAxisBody: (topProjectShare: string, leadProject: string) => string;
    leadProjectFallback: string;
    topProjectsTitle: string;
    focusMetricsTitle: string;
    metricTitles: {
      longestStreak: string;
      activeDays: string;
      projects: string;
      megaThreads: string;
    };
    activeDaysValue: (activeDays: number, activeRate: string) => string;
    projectsValue: (count: number) => string;
  };
};

const VIDEO_COPY: Record<SupportedLocale, VideoCopy> = {
  ko: {
    masthead: {
      title: "로컬 AI 작업 아카이브",
      navLabels: {
        overview: "개요",
        tempo: "리듬",
        projects: "프로젝트",
        read: "해석",
      },
      synced: "LOCAL LOGS SYNCED",
    },
    opening: {
      section: "AI 크리에이터 프로필",
      tokenChip: "토큰 집계: Codex + Claude",
      activityChip: (labels) => `활동 흔적: ${labels.join(" + ")}`,
      titleLines: [
        "로컬 AI 작업 기록을",
        "역할, 리듬, 프로젝트로 읽었습니다.",
      ],
      summary: (data) =>
        `${data.period.from}부터 ${data.period.to}까지의 로컬 기록을 보면, AI를 하나의 비서보다 역할이 다른 팀처럼 운영합니다. 구조와 탐색은 Claude가 받치고, 구현과 실행은 Codex가 밀어 올립니다.`,
      metricTitles: {
        totalTokens: "총 토큰",
        activeDays: "활성 일수",
        longestStreak: "최장 연속",
        threads: "스레드 수",
      },
    },
    system: {
      section: "시스템 요약",
      monthlyTitle: "월별 토큰 흐름",
      monthlySubtitleDual: (claudeLabel, codexLabel) =>
        `${claudeLabel}엔 Claude가, ${codexLabel}엔 Codex가 더 강했습니다. 막대 전체는 월별 총 토큰이고 색으로 도구 비중을 나눠 보여줍니다.`,
      monthlySubtitleSingle:
        "한 도구만 오래 끄는 패턴이 아니라, 시기와 맥락에 따라 사용 무게가 바뀝니다. 막대 전체는 월별 총 토큰입니다.",
      monthlyChips: {
        total: "막대 전체 = 월별 총 토큰",
        codex: "Codex = 피치",
        claude: "Claude = 스카이",
      },
      providerMixTitle: "AI 도구 믹스",
      providerMixNoteDual: (claudeLabel, codexLabel) =>
        `${claudeLabel}엔 Claude 비중이 컸고, ${codexLabel}엔 Codex가 구현 볼륨을 끌어올렸습니다.`,
      providerMixNoteSingle:
        "두 도구를 함께 쓰되, 최근엔 Codex 비중이 더 큰 운영 구조입니다.",
      providerTokens: (role, tokens) => `${role} · ${tokens} 토큰`,
      recentDailyTitle: "최근 일간 리듬",
      recentDailySubtitle:
        "최근 사용은 늘 켜두는 느낌보다는, 필요할 때 깊게 몰입하는 파동형 패턴에 가깝습니다.",
      monthlyTotalTokens: (tokens) => `${tokens} 토큰`,
    },
    rhythm: {
      section: "시간대 리듬",
      title: "시간대별 사용 리듬",
      subtitle:
        "오전 후반부터 오후 구간이 가장 강하고, 저녁에 다시 한 번 재진입하는 패턴이 보입니다.",
      peakTimes: "피크 시간대",
      strongDays: "강한 요일",
      interpretation: "해석",
      interpretationBody:
        "AI를 배경 채팅처럼 틀어두는 방식은 아닙니다. 필요가 생기면 강하게 들어오고, 한 번 들어오면 구조가 잡히고 결과가 날 때까지 깊게 파는 쪽에 가깝습니다.",
      hourChip: (hour, tokens) => `${hour}시 · ${tokens}`,
      weekdayChip: (day, tokens) => `${day}요일 · ${tokens}`,
    },
    persona: {
      section: "해석 레이어",
      badge: "내 해석",
      habits: "습관",
      strengths: "잘하는 점",
      cautions: "주의할 점",
      tendency: "작업 성향",
      extraActivity: "추가 활동 흔적",
      activityFootnote:
        "Codex/Claude는 토큰 기준으로, Gemini/Antigravity는 로컬 활동 흔적으로만 반영했습니다.",
    },
    projects: {
      section: "에너지가 들어간 곳",
      totalProjects: (count) => `전체 ${count}개`,
      topProject: (label, tokens) => `1위 ${label} ${tokens}`,
      multiTool: (count) => `멀티 툴 ${count}개`,
      workspaceSuffix: "WS",
      records: (count) => `${count}개 기록`,
      share: (percent) => `비중 ${percent}`,
    },
    closing: {
      section: "마무리",
      deepWorkChip: (count) => `${count} 깊은 작업 스레드`,
      headlineLines: ["역할을 나눠 쓸수록", "더 선명하게 완주합니다."],
      summary: (data, totalTokens) =>
        `전체 ${totalTokens} 토큰을 지나며 가장 뚜렷하게 보인 패턴은, AI를 하나의 도구가 아니라 역할이 다른 팀으로 운영할 때 결과가 가장 안정적으로 나왔다는 점입니다. ${data.providers[0]?.label || "Codex"}는 볼륨과 추진력을, ${data.providers[1]?.label || "Claude"}는 실험과 탐색의 완충 역할을 맡으며 작업을 밀어 올렸습니다.`,
      readPattern: "읽힌 패턴",
      toolPlacement: "도구 배치",
      focusMode: "집중 방식",
      projectAxis: "프로젝트 축",
      toolPlacementBody: (data) =>
        `${data.providers[0]?.label || "Codex"} ${Math.round((data.providers[0]?.share || 0) * 100)}%, ${data.providers[1]?.label || "Claude"} ${Math.round((data.providers[1]?.share || 0) * 100)}%. 한쪽으로 몰아붙이기보다 시기마다 도구의 역할을 나눠 쓰는 방식이 가장 안정적이었습니다.`,
      focusModeBody: (data) =>
        `${data.totals.deepWorkThreads.toLocaleString("en-US")}개의 깊은 작업 스레드와 ${data.totals.megaThreads.toLocaleString("en-US")}개의 50만+ 토큰 기록을 보면, 늘 켜두는 사용보다 필요할 때 길게 몰입하는 작업 리듬이 더 강하게 드러납니다.`,
      projectAxisBody: (topProjectShare, leadProject) =>
        `상위 3개 프로젝트가 전체 토큰의 ${topProjectShare}를 차지했습니다. 특히 ${leadProject}가 작업 중심축 역할을 하며, 다른 프로젝트들은 그 주변에서 실험과 파생 작업으로 확장됐습니다.`,
      leadProjectFallback: "대표 프로젝트",
      topProjectsTitle: "상위 프로젝트",
      focusMetricsTitle: "집중 지표",
      metricTitles: {
        longestStreak: "최장 연속",
        activeDays: "활성 일수",
        projects: "프로젝트",
        megaThreads: "50만+ 토큰",
      },
      activeDaysValue: (activeDays, activeRate) => `${activeDays}일 · ${activeRate}`,
      projectsValue: (count) => `${count}개`,
    },
  },
  en: {
    masthead: {
      title: "Local AI Work Archive",
      navLabels: {
        overview: "Overview",
        tempo: "Rhythm",
        projects: "Projects",
        read: "Read",
      },
      synced: "LOCAL LOGS SYNCED",
    },
    opening: {
      section: "AI Creator Profile",
      tokenChip: "Token coverage: Codex + Claude",
      activityChip: (labels) => `Activity traces: ${labels.join(" + ")}`,
      titleLines: [
        "Local AI work,",
        "read through role, rhythm, and projects.",
      ],
      summary: (data) =>
        `${data.period.from} to ${data.period.to}, the local record shows AI is used less like a single assistant and more like a team with distinct roles. Claude carries structure and exploration, while Codex pushes implementation and execution forward.`,
      metricTitles: {
        totalTokens: "Total Tokens",
        activeDays: "Active Days",
        longestStreak: "Longest Streak",
        threads: "Threads",
      },
    },
    system: {
      section: "System Summary",
      monthlyTitle: "Monthly Token Flow",
      monthlySubtitleDual: (claudeLabel, codexLabel) =>
        `Claude led in ${claudeLabel}, while Codex was stronger in ${codexLabel}. Each bar shows monthly total tokens, and color splits the provider mix.`,
      monthlySubtitleSingle:
        "The pattern is not one tool running constantly. Usage weight shifts with timing and context, and each bar shows monthly total tokens.",
      monthlyChips: {
        total: "Full bar = monthly total tokens",
        codex: "Codex = peach",
        claude: "Claude = sky",
      },
      providerMixTitle: "AI Tool Mix",
      providerMixNoteDual: (claudeLabel, codexLabel) =>
        `Claude carried more weight in ${claudeLabel}, while Codex drove execution volume in ${codexLabel}.`,
      providerMixNoteSingle:
        "The two tools are used together, with Codex carrying the larger share more recently.",
      providerTokens: (role, tokens) => `${role} · ${tokens} tokens`,
      recentDailyTitle: "Recent Daily Rhythm",
      recentDailySubtitle:
        "Recent usage looks less like something always-on and more like wave-shaped bursts of deep focus when needed.",
      monthlyTotalTokens: (tokens) => `${tokens} tokens`,
    },
    rhythm: {
      section: "Time Rhythm",
      title: "Usage Rhythm by Hour",
      subtitle:
        "Late morning into the afternoon is strongest, with another re-entry window in the evening.",
      peakTimes: "Peak Hours",
      strongDays: "Strong Days",
      interpretation: "Reading",
      interpretationBody:
        "This is not an always-on background chat pattern. The user enters hard when needed, and once engaged, tends to stay deep until structure appears and a result lands.",
      hourChip: (hour, tokens) => `${hour}:00 · ${tokens}`,
      weekdayChip: (day, tokens) => `${day} · ${tokens}`,
    },
    persona: {
      section: "Interpretation Layer",
      badge: "My Read",
      habits: "Habits",
      strengths: "Strengths",
      cautions: "Cautions",
      tendency: "Work Style",
      extraActivity: "Additional Activity",
      activityFootnote:
        "Codex and Claude are reflected with token totals, while Gemini and Antigravity are reflected only through local activity traces.",
    },
    projects: {
      section: "Where The Energy Went",
      totalProjects: (count) => `${count} projects`,
      topProject: (label, tokens) => `Top project ${label} ${tokens}`,
      multiTool: (count) => `${count} multi-tool`,
      workspaceSuffix: "WS",
      records: (count) => `${count} records`,
      share: (percent) => `Share ${percent}`,
    },
    closing: {
      section: "Closing Read",
      deepWorkChip: (count) => `${count} deep-work threads`,
      headlineLines: [
        "When roles are split with intent,",
        "the finish gets sharper.",
      ],
      summary: (data, totalTokens) =>
        `Across ${totalTokens} tokens, the clearest pattern is that outcomes stabilize most when AI is treated not as a single tool but as a team with distinct roles. ${data.providers[0]?.label || "Codex"} carries volume and momentum, while ${data.providers[1]?.label || "Claude"} absorbs experimentation and exploration friction.`,
      readPattern: "Observed Patterns",
      toolPlacement: "Tool Setup",
      focusMode: "Focus Mode",
      projectAxis: "Project Axis",
      toolPlacementBody: (data) =>
        `${data.providers[0]?.label || "Codex"} ${Math.round((data.providers[0]?.share || 0) * 100)}%, ${data.providers[1]?.label || "Claude"} ${Math.round((data.providers[1]?.share || 0) * 100)}%. The more stable pattern was not forcing everything through one tool, but splitting roles by moment and task.`,
      focusModeBody: (data) =>
        `${data.totals.deepWorkThreads.toLocaleString("en-US")} deep-work threads and ${data.totals.megaThreads.toLocaleString("en-US")} 500k+ token records show a rhythm driven less by always-on usage and more by long, deliberate focus when the work calls for it.`,
      projectAxisBody: (topProjectShare, leadProject) =>
        `The top three projects account for ${topProjectShare} of all tokens. ${leadProject} acts as the central working axis, while the surrounding projects branch outward as experiments and extensions.`,
      leadProjectFallback: "Lead project",
      topProjectsTitle: "Top Projects",
      focusMetricsTitle: "Focus Metrics",
      metricTitles: {
        longestStreak: "Longest Streak",
        activeDays: "Active Days",
        projects: "Projects",
        megaThreads: "500k+ Tokens",
      },
      activeDaysValue: (activeDays, activeRate) => `${activeDays} days · ${activeRate}`,
      projectsValue: (count) => `${count}`,
    },
  },
};

export const getVideoCopy = (locale?: string) =>
  VIDEO_COPY[resolveVideoLocale(locale)];
