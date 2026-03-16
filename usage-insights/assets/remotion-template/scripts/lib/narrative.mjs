import { HELPFULNESS_LABELS, OUTCOME_LABELS } from "./config.mjs";

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

export const buildNarrative = (_insights) => ({
  archetype: "",
  summary: "",
  worksBestAs: "",
  habits: [],
  strengths: [],
  cautions: [],
});
