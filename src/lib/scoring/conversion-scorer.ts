import type { Category } from "@prisma/client";
import type { ConversionScoreBreakdown } from "@/types";

type ConversionInput = {
  name: string;
  description: string;
  category: Category;
  margin: number;
  sellPrice: number;
  aiAnalysis?: string;
};

// Categories with easy problem demonstration
const HIGH_PROBLEM_AWARENESS: Category[] = [
  "PAIN_RELIEF", "ANTI_SNORING", "SLEEP", "BACK_NECK",
  "JOINTS_MOBILITY", "HAIR_REMOVAL",
];

// Categories with clear upsell options
const HIGH_UPSELL_CATEGORIES: Category[] = [
  "BEAUTY", "SKINCARE", "HEALTH", "WELLNESS", "PET_PRODUCTS",
  "HAIR_REMOVAL", "WOMENS_PRODUCTS",
];

// Categories with clear bundle options
const HIGH_BUNDLE_CATEGORIES: Category[] = [
  "BEAUTY", "SKINCARE", "HEALTH", "WELLNESS", "PET_PRODUCTS",
  "COMFORT", "SLEEP",
];

const TRUST_KEYWORDS = [
  "klinisch", "clinical", "zertifiziert", "certified", "getestet", "tested",
  "arzt", "doctor", "medizinisch", "medical", "studien", "study",
  "tausende", "thousands", "millionen", "million",
];

const STORY_KEYWORDS = [
  "wie ich", "how i", "meine geschichte", "my story", "verwandelt", "transformed",
  "endlich", "finally", "jahrelang", "for years", "verzweifelt", "desperate",
];

function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw)).length;
}

export function scoreConversion(input: ConversionInput): {
  score: number;
  breakdown: ConversionScoreBreakdown;
} {
  const text = `${input.name} ${input.description} ${input.aiAnalysis ?? ""}`;

  // Problem Awareness — how well-known is the problem?
  let problemAwareness = 40;
  if (HIGH_PROBLEM_AWARENESS.includes(input.category)) problemAwareness += 35;
  problemAwareness = Math.min(100, problemAwareness);

  // Solution Clarity — is the product's solution obvious?
  let solutionClarity = 50;
  if (["PAIN_RELIEF", "ANTI_SNORING", "HAIR_REMOVAL"].includes(input.category)) {
    solutionClarity += 30;
  }
  solutionClarity = Math.min(100, solutionClarity);

  // Trust Potential — how easy to build trust?
  let trustPotential = 40;
  trustPotential += Math.min(40, countKeywords(text, TRUST_KEYWORDS) * 10);
  if (input.sellPrice > 30) trustPotential += 10; // higher price = more social proof needed
  trustPotential = Math.min(100, trustPotential);

  // Storytelling Potential
  let storytelling = 45;
  storytelling += Math.min(35, countKeywords(text, STORY_KEYWORDS) * 8);
  if (["PAIN_RELIEF", "ANTI_SNORING", "BEAUTY", "SLEEP"].includes(input.category)) {
    storytelling += 20;
  }
  storytelling = Math.min(100, storytelling);

  // Upsell Potential — can we sell more?
  let upsellPotential = 35;
  if (HIGH_UPSELL_CATEGORIES.includes(input.category)) upsellPotential += 35;
  if (input.margin > 60) upsellPotential += 10; // high margin = upsell makes sense
  upsellPotential = Math.min(100, upsellPotential);

  // Bundle Potential
  let bundlePotential = 35;
  if (HIGH_BUNDLE_CATEGORIES.includes(input.category)) bundlePotential += 35;
  bundlePotential = Math.min(100, bundlePotential);

  const breakdown: ConversionScoreBreakdown = {
    problemAwareness,
    solutionClarity,
    trustPotential,
    storytelling,
    upsellPotential,
    bundlePotential,
  };

  const score = Math.round(
    problemAwareness * 0.20 +
    solutionClarity * 0.20 +
    trustPotential * 0.15 +
    storytelling * 0.15 +
    upsellPotential * 0.15 +
    bundlePotential * 0.15
  );

  return { score: Math.min(100, Math.max(0, score)), breakdown };
}
