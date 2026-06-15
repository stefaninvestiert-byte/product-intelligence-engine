import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import ExcelJS from "exceljs";
import { CATEGORY_LABELS } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format = "EXCEL", productIds, minWinnerScore = 0, limit = 100 } = body;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(productIds?.length ? { id: { in: productIds } } : {}),
        ...(minWinnerScore > 0 ? { scores: { winnerScore: { gte: minWinnerScore } } } : {}),
      },
      include: {
        scores: true,
        recommendations: true,
        marketData: true,
        competitors: { take: 3, orderBy: { adCount: "desc" } },
      },
      orderBy: { scores: { winnerScore: "desc" } },
      take: limit,
    });

    if (format === "CSV") {
      const rows = [
        // Header
        "Name,Kategorie,Einkauf (€),Verkauf (€),Marge (%),Winner Score,Emotional Score,Meta Score,Google Score,Conversion Score",
        // Data
        ...products.map((p) =>
          [
            `"${p.name}"`,
            CATEGORY_LABELS[p.category] ?? p.category,
            p.buyPrice.toFixed(2),
            p.sellPrice.toFixed(2),
            p.margin.toFixed(1),
            p.scores?.winnerScore?.toFixed(0) ?? "–",
            p.scores?.emotionalScore?.toFixed(0) ?? "–",
            p.scores?.metaAdsScore?.toFixed(0) ?? "–",
            p.scores?.googleAdsScore?.toFixed(0) ?? "–",
            p.scores?.conversionScore?.toFixed(0) ?? "–",
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="product-intelligence-${Date.now()}.csv"`,
        },
      });
    }

    if (format === "EXCEL") {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Product Intelligence Engine";
      workbook.created = new Date();

      // ===== SHEET 1: Products Overview =====
      const overviewSheet = workbook.addWorksheet("Produkt-Übersicht", {
        properties: { tabColor: { argb: "FF4472C4" } },
      });

      overviewSheet.columns = [
        { header: "Produkt", key: "name", width: 35 },
        { header: "Kategorie", key: "category", width: 20 },
        { header: "Einkauf (€)", key: "buyPrice", width: 12 },
        { header: "Verkauf (€)", key: "sellPrice", width: 12 },
        { header: "Marge (%)", key: "margin", width: 12 },
        { header: "Gewinn (€)", key: "marginAbsolute", width: 12 },
        { header: "Winner Score", key: "winnerScore", width: 14 },
        { header: "Emotional Score", key: "emotionalScore", width: 16 },
        { header: "Meta Ads Score", key: "metaAdsScore", width: 15 },
        { header: "Google Score", key: "googleAdsScore", width: 13 },
        { header: "Conversion Score", key: "conversionScore", width: 16 },
        { header: "Retourenrisiko", key: "returnRisk", width: 15 },
        { header: "Quelle", key: "source", width: 15 },
      ];

      // Style header row
      const headerRow = overviewSheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 11 };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = { bottom: { style: "medium", color: { argb: "FF4472C4" } } };
      });
      headerRow.height = 24;

      products.forEach((p, i) => {
        const row = overviewSheet.addRow({
          name: p.name,
          category: CATEGORY_LABELS[p.category] ?? p.category,
          buyPrice: p.buyPrice,
          sellPrice: p.sellPrice,
          margin: parseFloat(p.margin.toFixed(1)),
          marginAbsolute: parseFloat(p.marginAbsolute.toFixed(2)),
          winnerScore: p.scores?.winnerScore ?? 0,
          emotionalScore: p.scores?.emotionalScore ?? 0,
          metaAdsScore: p.scores?.metaAdsScore ?? 0,
          googleAdsScore: p.scores?.googleAdsScore ?? 0,
          conversionScore: p.scores?.conversionScore ?? 0,
          returnRisk: p.returnRisk,
          source: p.sourcePlatform,
        });

        // Alternate row colors
        const bgColor = i % 2 === 0 ? "FFF8FAFC" : "FFE2E8F0";
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          cell.font = { size: 10 };
        });

        // Color winner score
        const winnerCell = row.getCell("winnerScore");
        const score = p.scores?.winnerScore ?? 0;
        winnerCell.fill = {
          type: "pattern", pattern: "solid",
          fgColor: {
            argb: score >= 85 ? "FF065F46" :
                   score >= 70 ? "FF14532D" :
                   score >= 55 ? "FF78350F" : "FF7F1D1D"
          }
        };
        winnerCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        winnerCell.alignment = { horizontal: "center" };
      });

      // ===== SHEET 2: Recommendations =====
      const recoSheet = workbook.addWorksheet("KI-Empfehlungen", {
        properties: { tabColor: { argb: "FF7C3AED" } },
      });

      recoSheet.columns = [
        { header: "Produkt", key: "name", width: 30 },
        { header: "Zielgruppe", key: "targetAudience", width: 30 },
        { header: "Avatar", key: "avatar", width: 40 },
        { header: "Top Hook 1", key: "hook1", width: 50 },
        { header: "Top Hook 2", key: "hook2", width: 50 },
        { header: "Headline 1", key: "headline1", width: 40 },
        { header: "Angebot-Idee", key: "offer", width: 35 },
        { header: "Upsell-Idee", key: "upsell", width: 35 },
      ];

      const recoHeader = recoSheet.getRow(1);
      recoHeader.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4C1D95" } };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      recoHeader.height = 22;

      products.forEach((p) => {
        const r = p.recommendations;
        if (!r) return;
        recoSheet.addRow({
          name: p.name,
          targetAudience: r.targetAudience,
          avatar: r.avatar,
          hook1: r.hooks[0] ?? "",
          hook2: r.hooks[1] ?? "",
          headline1: r.headlines[0] ?? "",
          offer: r.offerIdeas[0] ?? "",
          upsell: r.upsellIdeas[0] ?? "",
        });
      });

      // ===== SHEET 3: Competitor Intel =====
      const compSheet = workbook.addWorksheet("Konkurrenz-Analyse", {
        properties: { tabColor: { argb: "FFDC2626" } },
      });

      compSheet.columns = [
        { header: "Produkt", key: "product", width: 30 },
        { header: "Konkurrent", key: "shop", width: 25 },
        { header: "Preis (€)", key: "price", width: 12 },
        { header: "Anzeigen", key: "adCount", width: 12 },
        { header: "Markt", key: "market", width: 12 },
        { header: "Erste Anzeige", key: "firstAd", width: 18 },
      ];

      const compHeader = compSheet.getRow(1);
      compHeader.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7F1D1D" } };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      });

      products.forEach((p) => {
        p.competitors.forEach((c) => {
          compSheet.addRow({
            product: p.name,
            shop: c.shopName,
            price: c.price,
            adCount: c.adCount,
            market: c.market,
            firstAd: c.firstAdSeen?.toLocaleDateString("de-AT") ?? "–",
          });
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(Buffer.from(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="product-intelligence-${Date.now()}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "Ungültiges Format. Nutze CSV oder EXCEL." }, { status: 400 });
  } catch (error) {
    console.error("POST /api/export error:", error);
    return NextResponse.json({ error: "Export fehlgeschlagen" }, { status: 500 });
  }
}
