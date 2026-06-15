import type { ProductAnalysisInput, ScoringResult } from "@/types";
import { scoreEmotional } from "./emotional-scorer";
import { scoreMetaAds } from "./meta-ads-scorer";
import { scoreGoogleAds } from "./google-ads-scorer";
import { scoreConversion } from "./conversion-scorer";

// Priority categories — high to low (Schmerzlösung first, gadgets last)
const PRIORITY_CATEGORY_SCORE: Record<string, number> = {
  PAIN_RELIEF:      100,
  HEALTH:           95,
  SLEEP:            90,
  ANTI_SNORING:     88,
  BACK_NECK:        85,
  JOINTS_MOBILITY:  82,
  WELLNESS:         75,
  COMFORT:          72,
  WOMENS_PRODUCTS:  68,
  SKINCARE:         65,
  HAIR_REMOVAL:     62,
  PET_PRODUCTS:     60,
  BEAUTY:           55,
  FASHION:          35,
  OTHER:            30,
  ELECTRONICS:      20,
  TOYS:             15,
};

type WinnerScoringInput = ProductAnalysisInput & {
  searchVolumeDe?: number;
  avgCpc?: number;
  competitionLevel?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  scalability?: number;
  hasPhysicalTransformation?: boolean;
  hasBeforeAfter?: boolean;
  isMedicalClaim?: boolean;
  aiAnalysis?: string;
  // AI-provided scores (overrides heuristic when available)
  aiProblemSolvingScore?: number;
  aiCompetitionScore?: number;
  aiDemandScore?: number;
  aiProfitScore?: number;
};

function calcProblemSolvingScore(input: WinnerScoringInput): number {
  if (input.aiProblemSolvingScore !== undefined) return input.aiProblemSolvingScore;
  const categoryPriority = PRIORITY_CATEGORY_SCORE[input.category] ?? 30;
  const emotionalBoost = ["PAIN_RELIEF", "SLEEP", "ANTI_SNORING", "BACK_NECK", "JOINTS_MOBILITY"].includes(input.category) ? 20 : 0;
  return Math.min(100, categoryPriority * 0.8 + emotionalBoost);
}

function calcCompetitionScore(input: WinnerScoringInput): number {
  if (input.aiCompetitionScore !== undefined) return input.aiCompetitionScore;
  const competitionScoreMap: Record<string, number> = { LOW: 90, MEDIUM: 65, HIGH: 35, VERY_HIGH: 10 };
  return input.competitionLevel ? (competitionScoreMap[input.competitionLevel] ?? 65) : 65;
}

function calcDemandScore(input: WinnerScoringInput): number {
  if (input.aiDemandScore !== undefined) return input.aiDemandScore;
  if (!input.searchVolumeDe) return 55;
  if (input.searchVolumeDe >= 100000) return 90;
  if (input.searchVolumeDe >= 50000)  return 80;
  if (input.searchVolumeDe >= 20000)  return 70;
  if (input.searchVolumeDe >= 10000)  return 60;
  if (input.searchVolumeDe >= 5000)   return 50;
  return 35;
}

function calcProfitScore(input: WinnerScoringInput): number {
  if (input.aiProfitScore !== undefined) return input.aiProfitScore;
  const margin = input.buyPrice > 0
    ? ((input.sellPrice - input.buyPrice) / input.sellPrice) * 100
    : 0;
  const marginScore = Math.min(100, (margin / 70) * 100);
  const scalabilityBonus = ((input.scalability ?? 60) - 50) * 0.4;
  return Math.min(100, Math.max(0, marginScore + scalabilityBonus));
}

export function calculateWinnerScore(input: WinnerScoringInput): ScoringResult {
  const description = (input as { description?: string }).description ?? "";

  const emotional = scoreEmotional({
    name: input.name,
    description,
    category: input.category,
    aiAnalysis: input.aiAnalysis,
  });

  const metaAds = scoreMetaAds({
    name: input.name,
    description,
    category: input.category,
    hasPhysicalTransformation: input.hasPhysicalTransformation,
    hasBeforeAfter: input.hasBeforeAfter,
    isMedicalClaim: input.isMedicalClaim,
    aiAnalysis: input.aiAnalysis,
  });

  const googleAds = scoreGoogleAds({
    name: input.name,
    description,
    category: input.category,
    searchVolumeDe: input.searchVolumeDe,
    avgCpc: input.avgCpc,
    competitionLevel: input.competitionLevel,
    aiAnalysis: input.aiAnalysis,
  });

  const conversion = scoreConversion({
    name: input.name,
    description,
    category: input.category,
    margin: input.buyPrice > 0 ? ((input.sellPrice - input.buyPrice) / input.sellPrice) * 100 : 0,
    sellPrice: input.sellPrice,
    aiAnalysis: input.aiAnalysis,
  });

  // New 4-dimension composite scores
  const problemSolvingScore = Math.round(calcProblemSolvingScore(input));
  const competitionScore    = Math.round(calcCompetitionScore(input));
  const demandScore         = Math.round(calcDemandScore(input));
  const profitScore         = Math.round(calcProfitScore(input));

  // WINNER SCORE: 35% PS + 25% Competition + 25% Demand + 15% Profit
  const winnerScore = Math.round(
    problemSolvingScore * 0.35 +
    competitionScore    * 0.25 +
    demandScore         * 0.25 +
    profitScore         * 0.15
  );

  return {
    winnerScore: Math.min(100, Math.max(0, winnerScore)),
    emotionalScore: emotional.score,
    metaAdsScore: metaAds.score,
    googleAdsScore: googleAds.score,
    conversionScore: conversion.score,
    problemSolvingScore,
    competitionScore,
    demandScore,
    profitScore,
    breakdown: {
      emotional: emotional.breakdown,
      metaAds: metaAds.breakdown,
      googleAds: googleAds.breakdown,
      conversion: conversion.breakdown,
    },
  };
}

export function getWinnerLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 85) return { label: "Top Winner", color: "text-emerald-400", emoji: "🏆" };
  if (score >= 70) return { label: "Sehr gut",   color: "text-green-400",   emoji: "⭐" };
  if (score >= 55) return { label: "Gut",         color: "text-yellow-400",  emoji: "👍" };
  if (score >= 40) return { label: "Mittel",      color: "text-orange-400",  emoji: "⚡" };
  return { label: "Schwach", color: "text-red-400", emoji: "⚠️" };
}

export function passesDefaultFilter(scores: {
  winnerScore: number;
  competitionScore: number;
  problemSolvingScore: number;
}): boolean {
  return (
    scores.winnerScore > 80 &&
    scores.competitionScore > 70 &&
    scores.problemSolvingScore > 80
  );
}
