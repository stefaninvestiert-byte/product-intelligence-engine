import type { Category } from "@prisma/client";
import type { EmotionalScoreBreakdown } from "@/types";

type EmotionalInput = {
  name: string;
  description: string;
  category: Category;
  aiAnalysis?: string;
};

const PAIN_KEYWORDS = [
  "schmerz", "pain", "ache", "relief", "lindern", "lindert", "lindert", "heilung",
  "rücken", "back", "nacken", "neck", "knie", "knee", "gelenk", "joint",
  "chronisch", "chronic", "entzündung", "inflammation", "arthritis",
];

const SHAME_KEYWORDS = [
  "schnarchen", "snoring", "snore", "schweiß", "sweat", "haare", "hair",
  "cellulite", "falten", "wrinkle", "akne", "acne", "übergewicht", "weight",
  "stretch", "poren", "pores", "verfärbung", "stain", "blemish",
];

const ANXIETY_KEYWORDS = [
  "schlaf", "sleep", "insomnia", "stress", "angst", "anxiety",
  "sicher", "safe", "secure", "schutz", "protect", "gesundheit", "health",
];

const COMFORT_KEYWORDS = [
  "komfort", "comfort", "bequem", "comfortable", "weich", "soft",
  "entspannung", "relax", "relaxation", "ergonomisch", "ergonomic",
];

const ATTRACTIVENESS_KEYWORDS = [
  "beauty", "schönheit", "attraktiv", "attractive", "jung", "young",
  "straff", "firm", "glatt", "smooth", "strahlen", "glow", "radiant",
];

const TIME_SAVING_KEYWORDS = [
  "schnell", "fast", "quick", "einfach", "easy", "einfach", "simple",
  "automatisch", "automatic", "sofort", "instant", "in minuten", "minutes",
];

const HEALTH_KEYWORDS = [
  "gesund", "healthy", "wellbeing", "wohlbefinden", "vital", "fitness",
  "immunsystem", "immune", "detox", "reinigung", "cleanse", "natur", "natural",
];

function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw)).length;
}

function keywordsToScore(count: number, max: number): number {
  return Math.min(100, (count / Math.max(1, max)) * 100);
}

const CATEGORY_BONUSES: Partial<Record<Category, Partial<EmotionalScoreBreakdown>>> = {
  PAIN_RELIEF: { painRelief: 30, health: 15 },
  ANTI_SNORING: { shame: 30, anxiety: 20 },
  SLEEP: { comfort: 20, anxiety: 25, health: 15 },
  BACK_NECK: { painRelief: 35, comfort: 15 },
  JOINTS_MOBILITY: { painRelief: 30, health: 20 },
  BEAUTY: { attractiveness: 35, selfConfidence: 20, shame: 10 },
  SKINCARE: { attractiveness: 25, shame: 15, health: 10 },
  HAIR_REMOVAL: { shame: 30, attractiveness: 25, selfConfidence: 15 },
  WOMENS_PRODUCTS: { shame: 15, selfConfidence: 20, comfort: 10 },
  HEALTH: { health: 30, anxiety: 15 },
  WELLNESS: { comfort: 20, health: 25, anxiety: 10 },
  COMFORT: { comfort: 35, timeSaving: 10 },
  PET_PRODUCTS: { anxiety: 20, comfort: 15 },
};

export function scoreEmotional(input: EmotionalInput): {
  score: number;
  breakdown: EmotionalScoreBreakdown;
} {
  const text = `${input.name} ${input.description} ${input.aiAnalysis ?? ""}`;
  const categoryBonuses = CATEGORY_BONUSES[input.category] ?? {};

  const breakdown: EmotionalScoreBreakdown = {
    painRelief: Math.min(100, keywordsToScore(countKeywords(text, PAIN_KEYWORDS), 3) + (categoryBonuses.painRelief ?? 0)),
    shame: Math.min(100, keywordsToScore(countKeywords(text, SHAME_KEYWORDS), 3) + (categoryBonuses.shame ?? 0)),
    anxiety: Math.min(100, keywordsToScore(countKeywords(text, ANXIETY_KEYWORDS), 3) + (categoryBonuses.anxiety ?? 0)),
    comfort: Math.min(100, keywordsToScore(countKeywords(text, COMFORT_KEYWORDS), 3) + (categoryBonuses.comfort ?? 0)),
    attractiveness: Math.min(100, keywordsToScore(countKeywords(text, ATTRACTIVENESS_KEYWORDS), 3) + (categoryBonuses.attractiveness ?? 0)),
    timeSaving: Math.min(100, keywordsToScore(countKeywords(text, TIME_SAVING_KEYWORDS), 3) + (categoryBonuses.timeSaving ?? 0)),
    selfConfidence: Math.min(100, (categoryBonuses.selfConfidence ?? 0) + keywordsToScore(countKeywords(text, ATTRACTIVENESS_KEYWORDS), 4)),
    health: Math.min(100, keywordsToScore(countKeywords(text, HEALTH_KEYWORDS), 3) + (categoryBonuses.health ?? 0)),
  };

  // Weighted average — pain and shame drive purchase most
  const score =
    breakdown.painRelief * 0.22 +
    breakdown.shame * 0.18 +
    breakdown.anxiety * 0.12 +
    breakdown.comfort * 0.10 +
    breakdown.attractiveness * 0.15 +
    breakdown.timeSaving * 0.08 +
    breakdown.selfConfidence * 0.10 +
    breakdown.health * 0.05;

  return { score: Math.round(score), breakdown };
}
