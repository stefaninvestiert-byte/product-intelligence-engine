import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeProductWithClaude(input: {
  name: string;
  description: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  targetMarkets: string[];
  sourceUrl?: string;
}): Promise<{
  enhancedDescription: string;
  emotionalAnalysis: string;
  targetAudience: string;
  avatar: string;
  demographics: string;
  psychographics: string;
  buyingMotives: string[];
  emotionalTriggers: string[];
  adAngles: string[];
  hooks: string[];
  headlines: string[];
  offerIdeas: string[];
  bundleIdeas: string[];
  upsellIdeas: string[];
  primaryText: string;
  hasPhysicalTransformation: boolean;
  hasBeforeAfter: boolean;
  isMedicalClaim: boolean;
  scalabilityAssessment: number;
  returnRiskAssessment: string;
  // New 4-dimension scores (0-100)
  problemSolvingScore: number;
  competitionScore: number;
  demandScore: number;
  profitScore: number;
  metaAdsPotenzial: string;
  googleAdsPotenzial: string;
}> {
  const margin = input.buyPrice > 0
    ? Math.round(((input.sellPrice - input.buyPrice) / input.sellPrice) * 100)
    : 0;

  const prompt = `Du bist ein Elite E-Commerce-Experte und Produktanalyst mit 15 Jahren Erfahrung im Dropshipping-Markt (DACH + Nordics).

Analysiere folgendes Produkt vollständig für den deutschen/österreichischen/niederländischen/schwedischen Markt:

**Produkt:** ${input.name}
**Beschreibung:** ${input.description}
**Kategorie:** ${input.category}
**Einkaufspreis:** ${input.buyPrice}€
**Verkaufspreis:** ${input.sellPrice}€
**Marge:** ${margin}%
**Zielmärkte:** ${input.targetMarkets.join(", ")}
${input.sourceUrl ? `**Quelle:** ${input.sourceUrl}` : ""}

## Prioritäts-Framework (Scoring-Basis):
**HOCH (Score 80-100):** Schmerzlösung, Gesundheit, Schlaf, Schnarchen, Rücken, Gelenke, Mobilität, Komfort, Inkontinenz, Haut, Haarentfernung, Frauenprodukte, Haustiere
**NIEDRIG (Score 10-40):** Spielzeug, Deko, Gadgets, Elektronik, Trendprodukte

## Scoring-Dimensionen (0-100):

**Problem Solving Score (Gewichtung 35%):**
- Löst das Produkt ein echtes, dringendes Problem?
- Wie stark/häufig ist der Schmerz/das Problem?
- Emotionale Intensität und Dringlichkeit?
- Größe der betroffenen Zielgruppe?
- Passt zur Prioritätskategorie?

**Competition Score (Gewichtung 25%) — INVERTIERT (weniger Wettbewerb = höherer Score):**
- Wie viele aktive Shops/Anbieter existieren?
- Wie viele aktive Facebook/Meta Advertiser?
- Gibt es dominante Brands?
- Ist der Markt noch ungesättigt?

**Demand Score (Gewichtung 25%):**
- Suchvolumen auf Google DE/AT?
- Wachsende oder fallende Nachfrage?
- Kaufintention der Suchanfragen (transaktional)?
- Marktgröße DACH?

**Profit Score (Gewichtung 15%):**
- Marge (${margin}%) — Ziel: 60-70%+
- Versandrisiko (Größe, Gewicht, Zerbrechlichkeit)?
- Rücksenderisiko?
- Skalierbarkeit?

Erstelle eine JSON-Analyse mit EXAKT diesem Schema:

{
  "enhancedDescription": "Verbesserte Produktbeschreibung auf Deutsch (2-3 Sätze, problem-focused)",
  "emotionalAnalysis": "Welche Emotionen und Kaufmotive werden angesprochen",
  "targetAudience": "Beschreibung der Hauptzielgruppe",
  "avatar": "Detaillierter Kunde-Avatar (Name, Alter, Situation, konkretes Problem)",
  "demographics": "Demographische Merkmale (Alter, Geschlecht, Einkommen, Region)",
  "psychographics": "Psychographische Merkmale, Werte, Ängste, Wünsche",
  "buyingMotives": ["Motiv 1", "Motiv 2", "Motiv 3"],
  "emotionalTriggers": ["Trigger 1: Schmerz/Scham/Angst/Komfort/Attraktivität", "Trigger 2", "Trigger 3"],
  "adAngles": ["Werbewinkel 1", "Werbewinkel 2", "Werbewinkel 3", "Werbewinkel 4"],
  "hooks": ["Hook 1 (scroll-stopping)", "Hook 2", "Hook 3", "Hook 4", "Hook 5"],
  "headlines": ["Headline 1", "Headline 2", "Headline 3", "Headline 4"],
  "offerIdeas": ["Angebot 1", "Angebot 2", "Angebot 3"],
  "bundleIdeas": ["Bundle 1", "Bundle 2"],
  "upsellIdeas": ["Upsell 1", "Upsell 2"],
  "primaryText": "Meta-Anzeigentext (150-250 Wörter, emotional, problem-solution-framework)",
  "metaAdsPotenzial": "Kurze Bewertung: Warum gut/schlecht für Meta Ads (2-3 Sätze)",
  "googleAdsPotenzial": "Kurze Bewertung: Warum gut/schlecht für Google Ads (2-3 Sätze)",
  "hasPhysicalTransformation": true,
  "hasBeforeAfter": true,
  "isMedicalClaim": false,
  "scalabilityAssessment": 75,
  "returnRiskAssessment": "LOW",
  "problemSolvingScore": 85,
  "competitionScore": 72,
  "demandScore": 68,
  "profitScore": 80
}

Wichtige Regeln:
- Scores basieren auf realem Markt-Wissen über den DACH-Raum
- problemSolvingScore: hoch bei echten Schmerzen/Gesundheitsproblemen, niedrig bei Spielzeug/Gadgets
- competitionScore: 80+ = kaum Konkurrenz, 50 = mittlere Konkurrenz, 20- = sehr gesättigter Markt
- demandScore: basiert auf geschätztem Suchvolumen und Trend-Richtung
- profitScore: ${margin}% Marge fließt direkt ein (60%+ = sehr gut)
- Alle Texte auf Deutsch
- hooks müssen scroll-stopping für Facebook/Instagram/TikTok sein

Antworte NUR mit dem JSON-Objekt, keine weiteren Erklärungen.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback if JSON parsing fails
    return {
      enhancedDescription: input.description,
      emotionalAnalysis: "Automatische Analyse fehlgeschlagen",
      targetAudience: "Breite Zielgruppe",
      avatar: "Erwachsene Person mit Interesse am Produkt",
      demographics: "25-55 Jahre",
      psychographics: "Qualitätsbewusst, gesundheitsorientiert",
      buyingMotives: ["Problemlösung", "Komfort", "Gesundheit"],
      emotionalTriggers: ["Schmerzvermeidung", "Komfort", "Lebensqualität"],
      adAngles: ["Problemlösung", "Lifestyle", "Soziale Bewährtheit"],
      hooks: [
        `Endlich eine Lösung für dein Problem mit ${input.name}!`,
        `Tausende schwören auf dieses Produkt...`,
        `Warum leidest du noch, wenn es SO einfach geht?`,
      ],
      headlines: [
        `${input.name} – Jetzt kaufen & profitieren`,
        `Das meistverkaufte Produkt der Saison`,
      ],
      offerIdeas: ["3 für 2 Aktion", "Gratis Versand ab 50€", "30 Tage Geld-zurück"],
      bundleIdeas: ["Starter-Set", "Premium-Bundle"],
      upsellIdeas: ["Extended Warranty", "Premium Version"],
      primaryText: `Kennst du das Gefühl? ${input.name} löst genau das Problem, das dich täglich begleitet. Tausende zufriedene Kunden bestätigen: Es funktioniert wirklich. Jetzt bestellen und selbst überzeugen!`,
      metaAdsPotenzial: "Mittleres Potenzial für Meta Ads.",
      googleAdsPotenzial: "Mittleres Potenzial für Google Ads.",
      hasPhysicalTransformation: false,
      hasBeforeAfter: false,
      isMedicalClaim: false,
      scalabilityAssessment: 60,
      returnRiskAssessment: "MEDIUM",
      problemSolvingScore: 60,
      competitionScore: 65,
      demandScore: 55,
      profitScore: Math.min(100, Math.round((margin / 70) * 100)),
    };
  }
}

export async function generateDailyTrends(categories: string[], markets: string[]): Promise<{
  trendingProducts: Array<{
    name: string;
    category: string;
    reasoning: string;
    estimatedMargin: number;
    urgency: string;
  }>;
}> {
  const prompt = `Du bist ein Elite E-Commerce Research Director.

Basierend auf aktuellen Markttrends (${new Date().toLocaleDateString("de-AT")}), identifiziere 5-8 Produkte, die jetzt gerade Potenzial haben für:
- Märkte: ${markets.join(", ")}
- Kategorien: ${categories.join(", ")}

Priorität auf:
- Echte Schmerzen/Probleme lösen (Schmerzlösung, Gesundheit, Schlaf, Schnarchen, Rücken, Gelenke)
- KEIN TikTok-Gimmick, keine Dekoration, keine Spielzeuge
- Hohe Marge (>60%)
- Niedriges Retourenrisiko
- Wenig Konkurrenz im DACH-Raum

Antworte als JSON:
{
  "trendingProducts": [
    {
      "name": "Produktname auf Deutsch",
      "category": "PAIN_RELIEF|HEALTH|SLEEP|ANTI_SNORING|BACK_NECK|JOINTS_MOBILITY|etc",
      "reasoning": "Warum jetzt, warum profitabel, welches Problem wird gelöst",
      "estimatedMargin": 65,
      "urgency": "HIGH|MEDIUM|LOW"
    }
  ]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { trendingProducts: [] };
  }
}
