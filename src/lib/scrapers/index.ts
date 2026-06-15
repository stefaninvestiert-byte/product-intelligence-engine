import prisma from "@/lib/db";
import { analyzeAndScoreProduct } from "@/lib/ai/analyzer";
import type { DataSource, Category, Market } from "@prisma/client";

// Product data structure returned by scrapers
export type ScrapedProduct = {
  name: string;
  description: string;
  category: Category;
  buyPrice: number;
  sellPrice: number;
  imageUrl?: string;
  sourceUrl?: string;
  sourcePlatform: DataSource;
  targetMarkets: Market[];
};

// Main scraper orchestrator
export async function runDailyScan(): Promise<{
  total: number;
  newProducts: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let total = 0;
  let newProducts = 0;

  const scanners: Array<() => Promise<ScrapedProduct[]>> = [
    () => scrapeAliExpressTrending(),
    () => scrapeFacebookAdLibrary(),
    () => scrapeTikTokTrending(),
    () => scrapeAmazonBestseller(),
    () => scrapeRedditTrending(),
    () => scrapeGoogleTrends(),
  ];

  for (const scanner of scanners) {
    try {
      const products = await scanner();
      total += products.length;

      for (const product of products) {
        const isNew = await saveScrapedProduct(product);
        if (isNew) newProducts++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(msg);
      console.error("Scraper error:", msg);
    }
  }

  return { total, newProducts, errors };
}

async function saveScrapedProduct(product: ScrapedProduct): Promise<boolean> {
  // Check if product already exists (by name similarity)
  const existing = await prisma.product.findFirst({
    where: {
      name: { equals: product.name, mode: "insensitive" },
    },
  });

  if (existing) return false;

  // Calculate margin
  const margin = product.buyPrice > 0
    ? ((product.sellPrice - product.buyPrice) / product.sellPrice) * 100
    : 0;
  const marginAbsolute = product.sellPrice - product.buyPrice;

  // Only save products with adequate margin
  if (margin < 40) return false;

  const saved = await prisma.product.create({
    data: {
      name: product.name,
      description: product.description,
      category: product.category,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      shippingCost: 3.99,
      margin,
      marginAbsolute,
      imageUrl: product.imageUrl,
      sourceUrl: product.sourceUrl,
      sourcePlatform: product.sourcePlatform,
      targetMarkets: product.targetMarkets,
    },
  });

  // Trigger AI analysis asynchronously
  analyzeAndScoreProduct(saved.id, {
    name: product.name,
    description: product.description,
    category: product.category,
    buyPrice: product.buyPrice,
    sellPrice: product.sellPrice,
    sourceUrl: product.sourceUrl,
    sourcePlatform: product.sourcePlatform,
    targetMarkets: product.targetMarkets,
  }).catch(console.error);

  return true;
}

// ============================================================
// SCRAPER IMPLEMENTATIONS
// Each scraper returns normalized product data.
// In production: use real APIs / Puppeteer / paid data sources.
// Currently returns curated seed data as baseline.
// ============================================================

async function scrapeAliExpressTrending(): Promise<ScrapedProduct[]> {
  // In production: Use AliExpress Affiliate API or scrape with Puppeteer
  // Rate limit: 1 request / 2 seconds
  console.log("[Scraper] AliExpress: Fetching trending products...");

  // Seed data representing real AliExpress trending health/beauty products
  return [
    {
      name: "Magnetische Wirbelsäulen-Stütze Pro",
      description: "Ergonomische Rückenstütze mit Magnettherapie für sofortige Schmerzlinderung. Klinisch getestetes Design für Büro und Heimgebrauch.",
      category: "BACK_NECK",
      buyPrice: 8.50,
      sellPrice: 39.99,
      sourcePlatform: "ALIEXPRESS",
      targetMarkets: ["DE", "AT", "NL", "SE"],
    },
    {
      name: "Anti-Schnarchen Nasenspreizer Premium",
      description: "Medizinisch entwickelter Nasenspreizer aus Silikon. Öffnet die Atemwege sofort und reduziert Schnarchen um bis zu 85%.",
      category: "ANTI_SNORING",
      buyPrice: 3.20,
      sellPrice: 24.99,
      sourcePlatform: "ALIEXPRESS",
      targetMarkets: ["DE", "AT", "NL"],
    },
    {
      name: "Infrarot-Kniebandage mit Turmalin",
      description: "Selbstwärmende Kniebandage mit Turmalin und Magneten. Lindert Arthritis-Schmerzen und verbessert die Durchblutung.",
      category: "JOINTS_MOBILITY",
      buyPrice: 6.80,
      sellPrice: 34.99,
      sourcePlatform: "ALIEXPRESS",
      targetMarkets: ["DE", "AT", "NL", "SE"],
    },
    {
      name: "Schlaf-Augenmassage Gerät",
      description: "Elektrisches Augenmassagegerät mit Wärme und Vibration. Reduziert Augenmüdigkeit und verbessert die Schlafqualität.",
      category: "SLEEP",
      buyPrice: 12.40,
      sellPrice: 59.99,
      sourcePlatform: "ALIEXPRESS",
      targetMarkets: ["DE", "AT", "NL", "SE"],
    },
  ];
}

async function scrapeFacebookAdLibrary(): Promise<ScrapedProduct[]> {
  // In production: Use Facebook Ad Library API
  // https://www.facebook.com/ads/library/api/
  console.log("[Scraper] Facebook Ad Library: Analyzing trending ads...");

  return [
    {
      name: "EMS Muskel-Stimulator Bauch",
      description: "Professioneller EMS Muskelstimulator für Bauch, Beine und Arme. Trainiert ohne Sport und sichtbare Ergebnisse in 4 Wochen.",
      category: "BEAUTY",
      buyPrice: 9.90,
      sellPrice: 49.99,
      sourcePlatform: "FACEBOOK_ADS",
      targetMarkets: ["DE", "AT", "NL"],
    },
    {
      name: "Perimenopause Schlaf-Spray Premium",
      description: "Natürliches Einschlaf-Spray für Frauen in der Menopause. Mit Melatonin, Lavendel und Baldrian für erholsamen Schlaf.",
      category: "WOMENS_PRODUCTS",
      buyPrice: 7.20,
      sellPrice: 39.99,
      sourcePlatform: "FACEBOOK_ADS",
      targetMarkets: ["DE", "AT"],
    },
  ];
}

async function scrapeTikTokTrending(): Promise<ScrapedProduct[]> {
  // In production: Use TikTok for Business API / Creative Center
  console.log("[Scraper] TikTok Creative Center: Analyzing trending content...");

  return [
    {
      name: "Gua Sha Gesichtsmassage-Set",
      description: "Premium Rosenquarz Gua Sha Set mit Jade Roller. Strafft die Haut, reduziert Schwellungen und fördert die Lymphdrainage.",
      category: "SKINCARE",
      buyPrice: 5.60,
      sellPrice: 29.99,
      sourcePlatform: "TIKTOK",
      targetMarkets: ["DE", "AT", "NL", "SE"],
    },
    {
      name: "IPL Haarentfernung Gerät Heim",
      description: "Professionelles IPL Gerät für dauerhafte Haarentfernung. 500.000 Blitze, 5 Intensitätsstufen, für Körper und Gesicht.",
      category: "HAIR_REMOVAL",
      buyPrice: 18.50,
      sellPrice: 89.99,
      sourcePlatform: "TIKTOK",
      targetMarkets: ["DE", "AT", "NL", "SE"],
    },
  ];
}

async function scrapeAmazonBestseller(): Promise<ScrapedProduct[]> {
  // In production: Use Amazon Product Advertising API
  console.log("[Scraper] Amazon Bestseller: Checking top sellers...");

  return [
    {
      name: "Orthopädisches Nackenkissen Bambus",
      description: "Ergonomisches Bambus-Nackenkissen mit Memory-Foam für Seiten- und Rückenschläfer. Reduziert Nackenschmerzen und verbessert den Schlaf.",
      category: "SLEEP",
      buyPrice: 14.20,
      sellPrice: 59.99,
      sourcePlatform: "AMAZON",
      targetMarkets: ["DE", "AT", "NL", "SE"],
    },
    {
      name: "Hunde-Gelenkergänzung Premium",
      description: "Tierärztlich empfohlene Gelenkergänzung für Hunde. Mit Glucosamin, Chondroitin und MSM für bewegliche Gelenke.",
      category: "PET_PRODUCTS",
      buyPrice: 8.90,
      sellPrice: 39.99,
      sourcePlatform: "AMAZON",
      targetMarkets: ["DE", "AT"],
    },
  ];
}

async function scrapeRedditTrending(): Promise<ScrapedProduct[]> {
  // In production: Use Reddit API to find trending products in relevant subreddits
  console.log("[Scraper] Reddit: Analyzing product discussions...");

  return [
    {
      name: "Akupressur-Matte & Kissen Set",
      description: "Professionelle Akupressur-Matte mit 6000 Akupunkturpunkten. Löst Verspannungen, reduziert Stress und verbessert den Schlaf.",
      category: "WELLNESS",
      buyPrice: 11.30,
      sellPrice: 49.99,
      sourcePlatform: "REDDIT",
      targetMarkets: ["DE", "AT", "NL", "SE"],
    },
  ];
}

async function scrapeGoogleTrends(): Promise<ScrapedProduct[]> {
  // In production: Use Google Trends API or SerpAPI
  console.log("[Scraper] Google Trends: Analyzing search trends...");

  return [
    {
      name: "Kältetherapie Eis-Roller Gesicht",
      description: "Professioneller Eis-Roller für das Gesicht. Reduziert Entzündungen, verkleinert Poren und strafft die Haut sofort sichtbar.",
      category: "SKINCARE",
      buyPrice: 4.80,
      sellPrice: 24.99,
      sourcePlatform: "GOOGLE_TRENDS",
      targetMarkets: ["DE", "AT", "NL", "SE"],
    },
  ];
}
