import { HELPFULNESS_LABELS, OUTCOME_LABELS } from "./config.mjs";
import { formatNumber, sum } from "./utils.mjs";

export const inferProviderRole = (category) => {
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

export const labelOutcome = (value) => OUTCOME_LABELS[value] || value || OUTCOME_LABELS.unknown;

export const labelHelpfulness = (value) =>
  HELPFULNESS_LABELS[value] || value || HELPFULNESS_LABELS.unknown;

export const buildNarrative = (insights) => {
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
