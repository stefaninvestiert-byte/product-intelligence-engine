import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { subDays, startOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") ?? "30");
    const market = searchParams.get("market");
    const productId = searchParams.get("productId");

    const from = startOfDay(subDays(new Date(), days));

    const where = {
      date: { gte: from },
      ...(market ? { market: market as "DE" | "AT" | "NL" | "SE" } : {}),
      ...(productId ? { productId } : {}),
    };

    // Rising trends (top 10 products with highest % change)
    const risingTrends = await prisma.productTrend.findMany({
      where: { ...where, direction: "RISING", percentChange: { gt: 10 } },
      include: { product: { select: { id: true, name: true, category: true } } },
      orderBy: { percentChange: "desc" },
      take: 10,
      distinct: ["productId"],
    });

    // Falling trends
    const fallingTrends = await prisma.productTrend.findMany({
      where: { ...where, direction: "FALLING" },
      include: { product: { select: { id: true, name: true, category: true } } },
      orderBy: { percentChange: "asc" },
      take: 10,
      distinct: ["productId"],
    });

    // Spike trends (sudden surge)
    const spikeTrends = await prisma.productTrend.findMany({
      where: { ...where, direction: "SPIKE" },
      include: { product: { select: { id: true, name: true, category: true } } },
      orderBy: { percentChange: "desc" },
      take: 5,
      distinct: ["productId"],
    });

    // Time series for chart (aggregate by day)
    const trendSeries = await prisma.productTrend.groupBy({
      by: ["date"],
      where,
      _avg: { searchVolume: true, trendScore: true },
      _count: { productId: true },
      orderBy: { date: "asc" },
    });

    // Category trend breakdown
    const categoryTrends = await prisma.product.groupBy({
      by: ["category"],
      where: { isActive: true },
      _avg: { margin: true },
      _count: { id: true },
    });

    return NextResponse.json({
      rising: risingTrends,
      falling: fallingTrends,
      spikes: spikeTrends,
      series: trendSeries,
      byCategory: categoryTrends,
    });
  } catch (error) {
    console.error("GET /api/trends error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Manually add trend data for a product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, searchVolume, trendScore, direction, percentChange, market, source } = body;

    const trend = await prisma.productTrend.create({
      data: {
        productId,
        searchVolume: searchVolume ?? 0,
        trendScore: trendScore ?? 50,
        direction: direction ?? "STABLE",
        percentChange: percentChange ?? 0,
        market: market ?? "DE",
        source: source ?? "GOOGLE_TRENDS",
      },
    });

    // Check for spike alert
    if (percentChange >= 30) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      await prisma.alert.create({
        data: {
          productId,
          type: "TREND_SPIKE",
          severity: "HIGH",
          title: `Trend-Spike: ${product?.name}`,
          message: `Suchvolumen für "${product?.name}" stieg um +${percentChange.toFixed(0)}% auf ${searchVolume.toLocaleString()} Suchanfragen/Monat.`,
          data: { percentChange, searchVolume, market },
        },
      });
    }

    return NextResponse.json(trend, { status: 201 });
  } catch (error) {
    console.error("POST /api/trends error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
