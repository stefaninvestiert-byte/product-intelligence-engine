import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { Category, Market, DataSource, ReturnRisk, Seasonality } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") as Category | null;
    const minWinnerScore = parseFloat(searchParams.get("minWinnerScore") ?? "0");
    const minMargin = parseFloat(searchParams.get("minMargin") ?? "0");
    const minCompetitionScore = parseFloat(searchParams.get("minCompetitionScore") ?? "0");
    const minProblemSolvingScore = parseFloat(searchParams.get("minProblemSolvingScore") ?? "0");
    const sortBy = searchParams.get("sortBy") ?? "winnerScore";
    const sortDir = (searchParams.get("sortDir") ?? "desc") as "asc" | "desc";

    // Build scores filter — combine all score conditions with AND
    const scoresFilter: Record<string, unknown> = {};
    if (minWinnerScore > 0) scoresFilter.winnerScore = { gte: minWinnerScore };
    if (minCompetitionScore > 0) scoresFilter.competitionScore = { gte: minCompetitionScore };
    if (minProblemSolvingScore > 0) scoresFilter.problemSolvingScore = { gte: minProblemSolvingScore };

    const where: Record<string, unknown> = {
      isActive: true,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(category ? { category } : {}),
      ...(minMargin > 0 ? { margin: { gte: minMargin } } : {}),
      ...(Object.keys(scoresFilter).length > 0 ? { scores: scoresFilter } : {}),
    };

    const scoresSortFields = ["winnerScore", "emotionalScore", "metaAdsScore", "googleAdsScore",
      "problemSolvingScore", "competitionScore", "demandScore", "profitScore"];
    const orderBy = scoresSortFields.includes(sortBy)
      ? { scores: { [sortBy]: sortDir } }
      : { [sortBy]: sortDir };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          scores: true,
          _count: {
            select: { competitors: true, alerts: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, description, category, buyPrice, sellPrice,
      shippingCost = 3.99, targetMarkets = ["DE"],
      sourcePlatform = "MANUAL", sourceUrl, imageUrl,
      subcategory, returnRisk = "MEDIUM", seasonality = "YEAR_ROUND",
    } = body;

    if (!name || !category || !buyPrice || !sellPrice) {
      return NextResponse.json(
        { error: "name, category, buyPrice, sellPrice sind erforderlich" },
        { status: 400 }
      );
    }

    const margin = ((sellPrice - buyPrice) / sellPrice) * 100;
    const marginAbsolute = sellPrice - buyPrice;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category: category as Category,
        subcategory,
        buyPrice,
        sellPrice,
        shippingCost,
        margin,
        marginAbsolute,
        targetMarkets: targetMarkets as Market[],
        sourcePlatform: sourcePlatform as DataSource,
        sourceUrl,
        imageUrl,
        returnRisk: returnRisk as ReturnRisk,
        seasonality: seasonality as Seasonality,
      },
    });

    // Trigger async AI analysis
    const { analyzeAndScoreProduct } = await import("@/lib/ai/analyzer");
    analyzeAndScoreProduct(product.id, {
      name,
      description,
      category: category as Category,
      buyPrice,
      sellPrice,
      sourceUrl,
      sourcePlatform: sourcePlatform as DataSource,
      targetMarkets: targetMarkets as Market[],
    }).catch(console.error);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
