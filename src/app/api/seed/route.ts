import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== "Bearer seed-prod-intel-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.product.count();
  if (existing > 0) {
    return NextResponse.json({ message: `Already seeded: ${existing} products` });
  }

  const PRODUCTS = [
    { name: "Anti-Schnarchen Nasenspreizer Premium Set", category: "ANTI_SNORING" as const, buyPrice: 3.20, sellPrice: 24.99, shippingCost: 2.99, sourcePlatform: "ALIEXPRESS" as const, targetMarkets: ["DE","AT","NL"] as const },
    { name: "Magnetische Wirbelsäulen-Lordosenstütze", category: "BACK_NECK" as const, buyPrice: 8.50, sellPrice: 39.99, shippingCost: 3.99, sourcePlatform: "ALIEXPRESS" as const, targetMarkets: ["DE","AT","NL","SE"] as const },
    { name: "IPL Haarentfernungsgerät Pro 500k", category: "HAIR_REMOVAL" as const, buyPrice: 18.50, sellPrice: 89.99, shippingCost: 4.99, sourcePlatform: "TIKTOK" as const, targetMarkets: ["DE","AT","NL","SE"] as const },
    { name: "Orthopädisches Bambus-Nackenkissen", category: "SLEEP" as const, buyPrice: 14.20, sellPrice: 59.99, shippingCost: 4.99, sourcePlatform: "AMAZON" as const, targetMarkets: ["DE","AT","NL","SE"] as const },
    { name: "Infrarot-Kniebandage Turmalin Plus", category: "JOINTS_MOBILITY" as const, buyPrice: 6.80, sellPrice: 34.99, shippingCost: 2.99, sourcePlatform: "ALIEXPRESS" as const, targetMarkets: ["DE","AT","NL","SE"] as const },
    { name: "Rosenquarz Gua Sha & Jade Roller Set", category: "SKINCARE" as const, buyPrice: 5.60, sellPrice: 29.99, shippingCost: 2.49, sourcePlatform: "TIKTOK" as const, targetMarkets: ["DE","AT","NL","SE"] as const },
    { name: "EMS Muskelstimulator Bauchgurt", category: "BEAUTY" as const, buyPrice: 9.90, sellPrice: 49.99, shippingCost: 3.99, sourcePlatform: "FACEBOOK_ADS" as const, targetMarkets: ["DE","AT","NL"] as const },
    { name: "Akupressur-Matte & Kissen Premium Set", category: "WELLNESS" as const, buyPrice: 11.30, sellPrice: 49.99, shippingCost: 3.99, sourcePlatform: "REDDIT" as const, targetMarkets: ["DE","AT","NL","SE"] as const },
    { name: "Schlaf-Spray natürlich Melatonin", category: "SLEEP" as const, buyPrice: 7.20, sellPrice: 34.99, shippingCost: 2.49, sourcePlatform: "FACEBOOK_ADS" as const, targetMarkets: ["DE","AT"] as const },
    { name: "Hunde-Gelenkpflege Kapseln Premium", category: "PET_PRODUCTS" as const, buyPrice: 8.90, sellPrice: 39.99, shippingCost: 2.99, sourcePlatform: "AMAZON" as const, targetMarkets: ["DE","AT"] as const },
  ];

  const created = [];
  for (const p of PRODUCTS) {
    const pid = `seed-${p.name.toLowerCase().replace(/\s+/g,"-").slice(0,30)}`;
    const margin = (p.sellPrice - p.buyPrice) / p.sellPrice * 100;
    const product = await prisma.product.upsert({
      where: { id: pid },
      update: {},
      create: {
        id: pid,
        name: p.name,
        category: p.category,
        buyPrice: p.buyPrice,
        sellPrice: p.sellPrice,
        shippingCost: p.shippingCost,
        margin,
        marginAbsolute: p.sellPrice - p.buyPrice,
        scalability: 70,
        sourcePlatform: p.sourcePlatform,
        targetMarkets: [...p.targetMarkets],
      },
    });
    // Add 7 days trend data (lean)
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const pctChange = (Math.random() - 0.3) * 40;
      await prisma.productTrend.create({
        data: {
          productId: product.id,
          date,
          searchVolume: Math.floor(Math.random() * 5000) + 1000,
          trendScore: 40 + Math.random() * 50,
          direction: pctChange > 10 ? "RISING" : pctChange < -10 ? "FALLING" : "STABLE",
          percentChange: pctChange,
          market: "DE",
          source: "GOOGLE_TRENDS",
        },
      });
    }
    created.push(product.name);
  }

  return NextResponse.json({ seeded: created.length, products: created });
}
