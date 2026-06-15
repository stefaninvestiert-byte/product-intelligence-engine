import type { Category } from "@prisma/client";
import type { GoogleAdsScoreBreakdown } from "@/types";

type GoogleAdsInput = {
  name: string;
  description: string;
  category: Category;
  searchVolumeDe?: number;
  avgCpc?: number;
  competitionLevel?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  aiAnalysis?: string;
};

// High purchase-intent categories for Google Shopping / Search
const HIGH_INTENT_CATEGORIES: Category[] = [
  "PAIN_RELIEF", "SLEEP", "ANTI_SNORING", "BACK_NECK",
  "JOINTS_MOBILITY", "BEAUTY", "SKINCARE", "HAIR_REMOVAL",
];

const SOLUTION_KEYWORDS = [
  "kaufen", "buy", "bestellen", "order", "preis", "price",
  "günstig", "cheap", "test", "erfahrungen", "review",
  "empfehlung", "recommendation", "wo kaufen", "where to buy",
];

const HIGH_INTENT_KEYWORDS = [
  "jetzt kaufen", "buy now", "bestes", "best", "top", "nummer 1",
  "sofort lieferbar", "in stock", "kostenloser versand", "free shipping",
];

function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw)).length;
}

export function scoreGoogleAds(input: GoogleAdsInput): {
  score: number;
  breakdown: GoogleAdsScoreBreakdown;
} {
  const text = `${input.name} ${input.description} ${input.aiAnalysis ?? ""}`;

  // Search Intent — how solution-aware searchers are
  let searchIntent = 40;
  if (HIGH_INTENT_CATEGORIES.includes(input.category)) searchIntent += 25;
  searchIntent += Math.min(25, countKeywords(text, SOLUTION_KEYWORDS) * 5);
  searchIntent = Math.min(100, searchIntent);

  // Keyword Potential — volume and diversity
  let keywordPotential = 40;
  if (input.searchVolumeDe) {
    if (input.searchVolumeDe > 50000) keywordPotential = 100;
    else if (input.searchVolumeDe > 10000) keywordPotential = 80;
    else if (input.searchVolumeDe > 5000) keywordPotential = 65;
    else if (input.searchVolumeDe > 1000) keywordPotential = 50;
    else keywordPotential = 30;
  }

  // Buying Intent
  let buyingIntent = 45;
  if (HIGH_INTENT_CATEGORIES.includes(input.category)) buyingIntent += 20;
  buyingIntent += Math.min(25, countKeywords(text, HIGH_INTENT_KEYWORDS) * 8);
  buyingIntent = Math.min(100, buyingIntent);

  // CPC Risk — high CPC = harder to profit (inverted: low = good)
  let cpcRisk = 30;
  if (input.avgCpc) {
    if (input.avgCpc > 3) cpcRisk = 80;
    else if (input.avgCpc > 2) cpcRisk = 60;
    else if (input.avgCpc > 1) cpcRisk = 40;
    else cpcRisk = 20;
  }

  // Competition Level (inverted: low competition = good score)
  let competitionScore = 70; // default: medium
  if (input.competitionLevel) {
    const map = { LOW: 90, MEDIUM: 65, HIGH: 35, VERY_HIGH: 15 };
    competitionScore = map[input.competitionLevel];
  }

  const breakdown: GoogleAdsScoreBreakdown = {
    searchIntent,
    keywordPotential,
    buyingIntent,
    cpcRisk,
    competitionLevel: competitionScore,
  };

  const score = Math.round(
    searchIntent * 0.25 +
    keywordPotential * 0.25 +
    buyingIntent * 0.25 +
    (100 - cpcRisk) * 0.10 +
    competitionScore * 0.15
  );

  return { score: Math.min(100, Math.max(0, score)), breakdown };
}
