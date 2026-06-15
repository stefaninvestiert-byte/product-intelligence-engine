import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { analyzeAndScoreProduct } from "@/lib/ai/analyzer";
import type { Category, Market, DataSource } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, force = false } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId erforderlich" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { scores: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
    }

    // Skip if recently analyzed (last 6h) unless forced
    if (!force && product.scores && product.updatedAt > new Date(Date.now() - 6 * 60 * 60 * 1000)) {
      return NextResponse.json({
        message: "Bereits kürzlich analysiert",
        scores: product.scores,
      });
    }

    await analyzeAndScoreProduct(productId, {
      name: product.name,
      description: product.description ?? "",
      category: product.category as Category,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      sourceUrl: product.sourceUrl ?? undefined,
      sourcePlatform: product.sourcePlatform as DataSource,
      targetMarkets: product.targetMarkets as Market[],
    });

    const updated = await prisma.productScore.findUnique({ where: { productId } });

    return NextResponse.json({
      message: "Analyse abgeschlossen",
      scores: updated,
    });
  } catch (error) {
    console.error("POST /api/analysis error:", error);
    return NextResponse.json({ error: "Analyse fehlgeschlagen" }, { status: 500 });
  }
}

// Bulk analyze all unscored products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "10");

    const unscored = await prisma.product.findMany({
      where: {
        isActive: true,
        scores: null,
      },
      take: limit,
    });

    const results = await Promise.allSettled(
      unscored.map((p) =>
        analyzeAndScoreProduct(p.id, {
          name: p.name,
          description: p.description ?? "",
          category: p.category as Category,
          buyPrice: p.buyPrice,
          sellPrice: p.sellPrice,
          sourceUrl: p.sourceUrl ?? undefined,
          sourcePlatform: p.sourcePlatform as DataSource,
          targetMarkets: p.targetMarkets as Market[],
        })
      )
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      message: `${succeeded} Produkte analysiert, ${failed} Fehler`,
      total: unscored.length,
      succeeded,
      failed,
    });
  } catch (error) {
    console.error("GET /api/analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
