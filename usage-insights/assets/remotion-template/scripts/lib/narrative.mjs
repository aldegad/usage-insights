import {
  CATEGORY_LABELS,
  HELPFULNESS_LABELS,
  OUTCOME_LABELS,
} from "./config.mjs";
import { PROVIDER_ROLE_LABELS } from "./labels.mjs";

export const inferProviderRole = (category) => {
  if (category === CATEGORY_LABELS.structureReview) {
    return PROVIDER_ROLE_LABELS.structureReview;
  }

  if (category === CATEGORY_LABELS.implementation) {
    return PROVIDER_ROLE_LABELS.implementation;
  }

  if (category === CATEGORY_LABELS.designFront) {
    return PROVIDER_ROLE_LABELS.designFront;
  }

  if (category === CATEGORY_LABELS.integration) {
    return PROVIDER_ROLE_LABELS.integration;
  }

  return PROVIDER_ROLE_LABELS.other;
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
