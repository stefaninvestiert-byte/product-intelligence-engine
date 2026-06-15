import prisma from "@/lib/db";
import { analyzeProductWithClaude } from "./claude";
import { calculateWinnerScore } from "@/lib/scoring/winner-scorer";
import type { ProductAnalysisInput } from "@/types";
import type { ReturnRisk } from "@prisma/client";

export async function analyzeAndScoreProduct(
  productId: string,
  input: ProductAnalysisInput & { description?: string }
): Promise<void> {
  // 1. AI Analysis via Claude
  const aiResult = await analyzeProductWithClaude({
    name: input.name,
    description: input.description ?? "",
    category: input.category,
    buyPrice: input.buyPrice,
    sellPrice: input.sellPrice,
    targetMarkets: input.targetMarkets,
    sourceUrl: input.sourceUrl,
  });

  // 2. Fetch existing market data for heuristic scoring
  const marketData = await prisma.marketData.findUnique({ where: { productId } });

  // 3. Calculate all scores — AI-provided scores take priority
  const scores = calculateWinnerScore({
    ...input,
    description: aiResult.enhancedDescription,
    searchVolumeDe: marketData?.searchVolumeDe ?? undefined,
    avgCpc: marketData?.avgCpc ?? undefined,
    competitionLevel: marketData?.competitionLevel as "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" | undefined,
    scalability: aiResult.scalabilityAssessment,
    hasPhysicalTransformation: aiResult.hasPhysicalTransformation,
    hasBeforeAfter: aiResult.hasBeforeAfter,
    isMedicalClaim: aiResult.isMedicalClaim,
    aiAnalysis: aiResult.emotionalAnalysis,
    // Pass AI-provided 4-dimension scores
    aiProblemSolvingScore: aiResult.problemSolvingScore,
    aiCompetitionScore: aiResult.competitionScore,
    aiDemandScore: aiResult.demandScore,
    aiProfitScore: aiResult.profitScore,
  });

  // 4. Save scores
  const scoreData = {
    winnerScore: scores.winnerScore,
    emotionalScore: scores.emotionalScore,
    metaAdsScore: scores.metaAdsScore,
    googleAdsScore: scores.googleAdsScore,
    conversionScore: scores.conversionScore,
    // New composite scores
    problemSolvingScore: scores.problemSolvingScore,
    competitionScore: scores.competitionScore,
    demandScore: scores.demandScore,
    profitScore: scores.profitScore,
    // Emotional breakdown
    painRelief: scores.breakdown.emotional.painRelief,
    shame: scores.breakdown.emotional.shame,
    anxiety: scores.breakdown.emotional.anxiety,
    comfort: scores.breakdown.emotional.comfort,
    attractiveness: scores.breakdown.emotional.attractiveness,
    timeSaving: scores.breakdown.emotional.timeSaving,
    selfConfidence: scores.breakdown.emotional.selfConfidence,
    health: scores.breakdown.emotional.health,
    // Meta breakdown
    ugcPotential: scores.breakdown.metaAds.ugcPotential,
    hookPotential: scores.breakdown.metaAds.hookPotential,
    scrollStopper: scores.breakdown.metaAds.scrollStopper,
    creativePotential: scores.breakdown.metaAds.creativePotential,
    beforeAfterRisk: scores.breakdown.metaAds.beforeAfterRisk,
    complianceRisk: scores.breakdown.metaAds.complianceRisk,
    // Google breakdown
    searchIntent: scores.breakdown.googleAds.searchIntent,
    keywordPotential: scores.breakdown.googleAds.keywordPotential,
    buyingIntent: scores.breakdown.googleAds.buyingIntent,
    cpcRisk: scores.breakdown.googleAds.cpcRisk,
    competitionLevel: scores.breakdown.googleAds.competitionLevel,
    // Conversion breakdown
    problemAwareness: scores.breakdown.conversion.problemAwareness,
    solutionClarity: scores.breakdown.conversion.solutionClarity,
    trustPotential: scores.breakdown.conversion.trustPotential,
    storytelling: scores.breakdown.conversion.storytelling,
    upsellPotential: scores.breakdown.conversion.upsellPotential,
    bundlePotential: scores.breakdown.conversion.bundlePotential,
  };

  await prisma.productScore.upsert({
    where: { productId },
    create: { productId, ...scoreData },
    update: scoreData,
  });

  // 5. Save AI recommendations (including new emotionalTriggers)
  const recData = {
    targetAudience: aiResult.targetAudience,
    avatar: aiResult.avatar,
    demographics: aiResult.demographics,
    psychographics: aiResult.psychographics,
    buyingMotives: aiResult.buyingMotives,
    emotionalTriggers: aiResult.emotionalTriggers ?? [],
    adAngles: aiResult.adAngles,
    hooks: aiResult.hooks,
    headlines: aiResult.headlines,
    offerIdeas: aiResult.offerIdeas,
    bundleIdeas: aiResult.bundleIdeas,
    upsellIdeas: aiResult.upsellIdeas,
    primaryText: aiResult.primaryText,
  };

  await prisma.recommendation.upsert({
    where: { productId },
    create: { productId, ...recData },
    update: recData,
  });

  // 6. Update product with enhanced data
  const returnRisk = aiResult.returnRiskAssessment as ReturnRisk;
  await prisma.product.update({
    where: { id: productId },
    data: {
      scalability: aiResult.scalabilityAssessment,
      returnRisk: returnRisk,
      description: aiResult.enhancedDescription,
    },
  });

  // 7. Check for alerts
  await checkAndCreateAlerts(productId, scores.winnerScore, scores.problemSolvingScore);
}

async function checkAndCreateAlerts(
  productId: string,
  winnerScore: number,
  problemSolvingScore: number
): Promise<void> {
  if (winnerScore >= 85) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    await prisma.alert.create({
      data: {
        productId,
        type: "WINNER_SCORE_HIGH",
        severity: "HIGH",
        title: `Top Winner entdeckt: ${product?.name}`,
        message: `Produkt "${product?.name}" hat einen Winner Score von ${winnerScore}/100 und einen Problem Solving Score von ${problemSolvingScore}/100 erreicht. Sofortige Prüfung empfohlen.`,
        data: { winnerScore, problemSolvingScore, productId },
      },
    });
  }
}
