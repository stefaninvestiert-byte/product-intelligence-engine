import type { Category } from "@prisma/client";
import type { MetaAdsScoreBreakdown } from "@/types";

type MetaAdsInput = {
  name: string;
  description: string;
  category: Category;
  hasPhysicalTransformation?: boolean;
  hasBeforeAfter?: boolean;
  isMedicalClaim?: boolean;
  aiAnalysis?: string;
};

// Categories with highest UGC potential
const HIGH_UGC_CATEGORIES: Category[] = [
  "BEAUTY", "SKINCARE", "HAIR_REMOVAL", "PAIN_RELIEF", "SLEEP",
  "ANTI_SNORING", "BACK_NECK", "WOMENS_PRODUCTS", "PET_PRODUCTS",
];

// Categories where before/after is risky (Meta policy)
const BEFORE_AFTER_RISK_CATEGORIES: Category[] = [
  "BEAUTY", "SKINCARE", "HAIR_REMOVAL", "PAIN_RELIEF", "HEALTH",
];

// Categories with highest compliance risk (medical claims etc)
const HIGH_COMPLIANCE_RISK_CATEGORIES: Category[] = [
  "HEALTH", "PAIN_RELIEF", "BACK_NECK", "JOINTS_MOBILITY",
  "ANTI_SNORING", "SLEEP",
];

const VISUAL_DEMO_KEYWORDS = [
  "vorher nachher", "before after", "ergebnis", "result", "transformation",
  "wirkung", "effect", "vergleich", "comparison", "sichtbar", "visible",
];

const HOOK_KEYWORDS = [
  "geheimnis", "secret", "endlich", "finally", "stop", "stop using",
  "nie mehr", "never again", "warum", "why", "dieser trick", "this trick",
  "in sekunden", "in seconds", "sofort", "instantly",
];

function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw)).length;
}

export function scoreMetaAds(input: MetaAdsInput): {
  score: number;
  breakdown: MetaAdsScoreBreakdown;
} {
  const text = `${input.name} ${input.description} ${input.aiAnalysis ?? ""}`;

  // UGC Potential — how easy for real users to film authentic content
  let ugcPotential = 50;
  if (HIGH_UGC_CATEGORIES.includes(input.category)) ugcPotential += 30;
  if (input.hasPhysicalTransformation) ugcPotential += 20;
  ugcPotential = Math.min(100, ugcPotential);

  // Hook Potential — how easy to write strong ad hooks
  let hookPotential = 40;
  hookPotential += Math.min(40, countKeywords(text, HOOK_KEYWORDS) * 10);
  if (["PAIN_RELIEF", "ANTI_SNORING", "SLEEP", "BEAUTY"].includes(input.category)) {
    hookPotential += 20;
  }
  hookPotential = Math.min(100, hookPotential);

  // Scroll Stopper — visual interrupt potential
  let scrollStopper = 40;
  if (input.hasBeforeAfter) scrollStopper += 20;
  scrollStopper += Math.min(30, countKeywords(text, VISUAL_DEMO_KEYWORDS) * 8);
  if (["BEAUTY", "SKINCARE", "HAIR_REMOVAL", "PAIN_RELIEF"].includes(input.category)) {
    scrollStopper += 15;
  }
  scrollStopper = Math.min(100, scrollStopper);

  // Creative Potential — variety of creative angles
  let creativePotential = 50;
  if (HIGH_UGC_CATEGORIES.includes(input.category)) creativePotential += 20;
  if (input.hasPhysicalTransformation) creativePotential += 20;
  creativePotential = Math.min(100, creativePotential);

  // Before/After Risk — policy violation risk
  let beforeAfterRisk = 10;
  if (BEFORE_AFTER_RISK_CATEGORIES.includes(input.category)) beforeAfterRisk += 20;
  if (input.hasBeforeAfter) beforeAfterRisk += 30;
  beforeAfterRisk = Math.min(100, beforeAfterRisk);

  // Compliance Risk — medical claims etc
  let complianceRisk = 10;
  if (HIGH_COMPLIANCE_RISK_CATEGORIES.includes(input.category)) complianceRisk += 25;
  if (input.isMedicalClaim) complianceRisk += 35;
  complianceRisk = Math.min(100, complianceRisk);

  const breakdown: MetaAdsScoreBreakdown = {
    ugcPotential,
    hookPotential,
    scrollStopper,
    creativePotential,
    beforeAfterRisk,
    complianceRisk,
  };

  // Score: positive factors minus risk factors
  const positiveScore =
    ugcPotential * 0.30 +
    hookPotential * 0.25 +
    scrollStopper * 0.25 +
    creativePotential * 0.20;

  const riskPenalty = (beforeAfterRisk * 0.4 + complianceRisk * 0.6) * 0.2;

  const score = Math.max(0, Math.min(100, Math.round(positiveScore - riskPenalty)));

  return { score, breakdown };
}
