import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_PRODUCTS = [
  {
    name: "Anti-Schnarchen Nasenspreizer Premium Set",
    description: "Medizinisch entwickelter Nasenspreizer aus medizinischem Silikon. Öffnet die Nasengänge, verbessert die Atmung und reduziert Schnarchen um bis zu 85%.",
    category: "ANTI_SNORING" as const,
    buyPrice: 3.20,
    sellPrice: 24.99,
    shippingCost: 2.99,
    sourcePlatform: "ALIEXPRESS" as const,
    targetMarkets: ["DE", "AT", "NL"] as const,
    competitors: [
      { shopName: "SleepWell.de", price: 29.99, adCount: 47, market: "DE" as const },
      { shopName: "NachtruheShop", price: 19.99, adCount: 23, market: "AT" as const },
    ],
  },
  {
    name: "Magnetische Wirbelsäulen-Lordosenstütze",
    description: "Ergonomische Rückenstütze mit 4 integrierten Magneten für die Magnettherapie. Korrigiert die Körperhaltung, lindert Rückenschmerzen sofort.",
    category: "BACK_NECK" as const,
    buyPrice: 8.50,
    sellPrice: 39.99,
    shippingCost: 3.99,
    sourcePlatform: "ALIEXPRESS" as const,
    targetMarkets: ["DE", "AT", "NL", "SE"] as const,
    competitors: [
      { shopName: "RückenFit.de", price: 44.99, adCount: 89, market: "DE" as const },
    ],
  },
  {
    name: "IPL Haarentfernungsgerät Pro 500k",
    description: "Professionelles IPL-Gerät für dauerhafte Haarentfernung zuhause. 500.000 Blitze, 5 Intensitätsstufen, für Körper und Gesicht geeignet.",
    category: "HAIR_REMOVAL" as const,
    buyPrice: 18.50,
    sellPrice: 89.99,
    shippingCost: 4.99,
    sourcePlatform: "TIKTOK" as const,
    targetMarkets: ["DE", "AT", "NL", "SE"] as const,
    competitors: [
      { shopName: "SmoothSkin.de", price: 99.00, adCount: 134, market: "DE" as const },
      { shopName: "HaarlosGlücklich", price: 79.99, adCount: 67, market: "AT" as const },
    ],
  },
  {
    name: "Orthopädisches Bambus-Nackenkissen",
    description: "Ergonomisches Nackenkissen aus Bambusfaser mit Memory-Foam-Kern. Speziell für Seiten- und Rückenschläfer. Reduziert Nackenschmerzen nachweislich.",
    category: "SLEEP" as const,
    buyPrice: 14.20,
    sellPrice: 59.99,
    shippingCost: 4.99,
    sourcePlatform: "AMAZON" as const,
    targetMarkets: ["DE", "AT", "NL", "SE"] as const,
    competitors: [
      { shopName: "SchlafGut.de", price: 69.99, adCount: 56, market: "DE" as const },
    ],
  },
  {
    name: "Infrarot-Kniebandage Turmalin Plus",
    description: "Selbstwärmende Kniebandage mit Turmalin-Mineralien und 4 Magneten. Lindert Arthritis-Schmerzen, verbessert die Durchblutung und unterstützt die Heilung.",
    category: "JOINTS_MOBILITY" as const,
    buyPrice: 6.80,
    sellPrice: 34.99,
    shippingCost: 2.99,
    sourcePlatform: "ALIEXPRESS" as const,
    targetMarkets: ["DE", "AT", "NL", "SE"] as const,
    competitors: [
      { shopName: "GelenkeGesund", price: 39.99, adCount: 41, market: "DE" as const },
    ],
  },
  {
    name: "Rosenquarz Gua Sha & Jade Roller Set",
    description: "Premium Gua Sha Set aus echtem Rosenquarz mit Jade Roller. Strafft die Haut, reduziert Schwellungen, fördert Lymphdrainage. Das meistgekaufte Beauty-Tool auf TikTok.",
    category: "SKINCARE" as const,
    buyPrice: 5.60,
    sellPrice: 29.99,
    shippingCost: 2.49,
    sourcePlatform: "TIKTOK" as const,
    targetMarkets: ["DE", "AT", "NL", "SE"] as const,
    competitors: [
      { shopName: "GlowBeauty.de", price: 34.99, adCount: 112, market: "DE" as const },
    ],
  },
  {
    name: "EMS Muskelstimulator Bauchgurt",
    description: "Professioneller EMS-Bauchgurt mit 6 Trainingsprogrammen. Trainiert Bauch-, Rücken- und Beinmuskulatur ohne Sport. Sichtbare Ergebnisse in 4 Wochen.",
    category: "BEAUTY" as const,
    buyPrice: 9.90,
    sellPrice: 49.99,
    shippingCost: 3.99,
    sourcePlatform: "FACEBOOK_ADS" as const,
    targetMarkets: ["DE", "AT", "NL"] as const,
    competitors: [
      { shopName: "FitZuhause.de", price: 59.99, adCount: 78, market: "DE" as const },
    ],
  },
  {
    name: "Akupressur-Matte & Kissen Premium Set",
    description: "Professionelle Akupressur-Matte mit 6.240 Akupunkturpunkten inkl. Kissen. Löst Muskelverspannungen, reduziert Stress und verbessert die Schlafqualität.",
    category: "WELLNESS" as const,
    buyPrice: 11.30,
    sellPrice: 49.99,
    shippingCost: 3.99,
    sourcePlatform: "REDDIT" as const,
    targetMarkets: ["DE", "AT", "NL", "SE"] as const,
    competitors: [
      { shopName: "RelaxNow.de", price: 54.99, adCount: 35, market: "DE" as const },
    ],
  },
  {
    name: "Schlaf-Spray natürlich Melatonin",
    description: "Natürliches Einschlaf-Spray mit Melatonin 0,5mg, Lavendel und Baldrian. Hilft besonders Frauen in der Perimenopause. Klinisch getestet.",
    category: "SLEEP" as const,
    buyPrice: 7.20,
    sellPrice: 34.99,
    shippingCost: 2.49,
    sourcePlatform: "FACEBOOK_ADS" as const,
    targetMarkets: ["DE", "AT"] as const,
    competitors: [
      { shopName: "NaturSchlaf.at", price: 39.99, adCount: 61, market: "AT" as const },
    ],
  },
  {
    name: "Hunde-Gelenkpflege Kapseln Premium",
    description: "Tierärztlich empfohlene Gelenkergänzung für Hunde. Mit Glucosamin, Chondroitin, MSM und Omega-3. Für mehr Mobilität und weniger Schmerzen.",
    category: "PET_PRODUCTS" as const,
    buyPrice: 8.90,
    sellPrice: 39.99,
    shippingCost: 2.99,
    sourcePlatform: "AMAZON" as const,
    targetMarkets: ["DE", "AT"] as const,
    competitors: [
      { shopName: "HappyDog.de", price: 44.99, adCount: 29, market: "DE" as const },
    ],
  },
];

async function main() {
  console.log("🌱 Starte Database Seed...");

  for (const productData of SEED_PRODUCTS) {
    const { competitors, ...product } = productData;

    const margin = ((product.sellPrice - product.buyPrice) / product.sellPrice) * 100;
    const marginAbsolute = product.sellPrice - product.buyPrice;

    const created = await prisma.product.upsert({
      where: { id: `seed-${product.name.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}` },
      update: {},
      create: {
        id: `seed-${product.name.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}`,
        ...product,
        margin,
        marginAbsolute,
        scalability: 70,
      },
    });

    // Add competitors
    for (const comp of competitors) {
      await prisma.competitor.upsert({
        where: { id: `${created.id}-${comp.shopName}` },
        update: {},
        create: {
          id: `${created.id}-${comp.shopName}`,
          productId: created.id,
          ...comp,
          currency: "EUR",
        },
      });
    }

    // Add trend data (30 days)
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const baseVolume = Math.floor(Math.random() * 5000) + 1000;
      const percentChange = (Math.random() - 0.3) * 40;

      await prisma.productTrend.create({
        data: {
          productId: created.id,
          date,
          searchVolume: Math.floor(baseVolume * (1 + i * 0.01)),
          trendScore: 40 + Math.random() * 50,
          direction: percentChange > 10 ? "RISING" : percentChange < -10 ? "FALLING" : "STABLE",
          percentChange,
          market: "DE",
          source: "GOOGLE_TRENDS",
        },
      });
    }

    console.log(`✅ ${product.name}`);
  }

  console.log(`\n🎉 ${SEED_PRODUCTS.length} Produkte erstellt!`);
  console.log("⚡ Starte KI-Analyse für alle Produkte...");
  console.log("   → POST /api/analysis (GET) in der App ausführen");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
