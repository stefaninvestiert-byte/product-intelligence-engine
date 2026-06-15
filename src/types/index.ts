import type {
  Product,
  ProductScore,
  ProductTrend,
  Competitor,
  Alert,
  Recommendation,
  MarketData,
  ScanLog,
  Category,
  Market,
  DataSource,
  ReturnRisk,
  Seasonality,
  TrendDirection,
  AlertType,
  AlertSeverity,
  CompetitionLevel,
  ScanStatus,
} from "@prisma/client";

export type {
  Product,
  ProductScore,
  ProductTrend,
  Competitor,
  Alert,
  Recommendation,
  MarketData,
  ScanLog,
  Category,
  Market,
  DataSource,
  ReturnRisk,
  Seasonality,
  TrendDirection,
  AlertType,
  AlertSeverity,
  CompetitionLevel,
  ScanStatus,
};

export type ProductWithRelations = Product & {
  scores: ProductScore | null;
  trends: ProductTrend[];
  competitors: Competitor[];
  recommendations: Recommendation | null;
  marketData: MarketData | null;
  alerts: Alert[];
};

export type ProductListItem = Product & {
  scores: ProductScore | null;
  _count: {
    competitors: number;
    alerts: number;
  };
};

export type DashboardStats = {
  totalProducts: number;
  newToday: number;
  avgWinnerScore: number;
  topCategory: string;
  unreadAlerts: number;
  risingTrends: number;
};

export type TopProduct = {
  id: string;
  name: string;
  category: Category;
  margin: number;
  winnerScore: number;
  emotionalScore: number;
  metaAdsScore: number;
  imageUrl: string | null;
  trendDirection: TrendDirection;
};

export type ScraperConfig = {
  source: DataSource;
  markets: Market[];
  categories: Category[];
  maxProducts: number;
  rateLimit: number; // ms between requests
};

export type ProductAnalysisInput = {
  name: string;
  description: string;
  category: Category;
  buyPrice: number;
  sellPrice: number;
  sourceUrl?: string;
  sourcePlatform: DataSource;
  targetMarkets: Market[];
};

export type ScoringResult = {
  winnerScore: number;
  emotionalScore: number;
  metaAdsScore: number;
  googleAdsScore: number;
  conversionScore: number;
  // New composite scores
  problemSolvingScore: number;
  competitionScore: number;
  demandScore: number;
  profitScore: number;
  breakdown: ScoringBreakdown;
};

export type ScoringBreakdown = {
  emotional: EmotionalScoreBreakdown;
  metaAds: MetaAdsScoreBreakdown;
  googleAds: GoogleAdsScoreBreakdown;
  conversion: ConversionScoreBreakdown;
};

export type EmotionalScoreBreakdown = {
  painRelief: number;
  shame: number;
  anxiety: number;
  comfort: number;
  attractiveness: number;
  timeSaving: number;
  selfConfidence: number;
  health: number;
};

export type MetaAdsScoreBreakdown = {
  ugcPotential: number;
  hookPotential: number;
  scrollStopper: number;
  creativePotential: number;
  beforeAfterRisk: number;
  complianceRisk: number;
};

export type GoogleAdsScoreBreakdown = {
  searchIntent: number;
  keywordPotential: number;
  buyingIntent: number;
  cpcRisk: number;
  competitionLevel: number;
};

export type ConversionScoreBreakdown = {
  problemAwareness: number;
  solutionClarity: number;
  trustPotential: number;
  storytelling: number;
  upsellPotential: number;
  bundlePotential: number;
};

export type AIRecommendation = {
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
};

export type ExportFormat = "PDF" | "EXCEL" | "CSV";

export type ExportOptions = {
  format: ExportFormat;
  products: string[]; // product IDs
  includeScores: boolean;
  includeRecommendations: boolean;
  includeCompetitors: boolean;
  dateRange?: { from: Date; to: Date };
};

export type FilterOptions = {
  category?: Category[];
  market?: Market[];
  minWinnerScore?: number;
  minMargin?: number;
  maxReturnRisk?: ReturnRisk;
  seasonality?: Seasonality[];
  trendDirection?: TrendDirection[];
  sources?: DataSource[];
  search?: string;
  sortBy?: SortOption;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type SortOption =
  | "winnerScore"
  | "margin"
  | "createdAt"
  | "name"
  | "emotionalScore"
  | "metaAdsScore";

export const CATEGORY_LABELS: Record<Category, string> = {
  HEALTH: "Gesundheit",
  PAIN_RELIEF: "Schmerzlinderung",
  SLEEP: "Schlaf",
  COMFORT: "Komfort",
  WELLNESS: "Wohlbefinden",
  ANTI_SNORING: "Anti-Schnarchen",
  BACK_NECK: "Rücken & Nacken",
  JOINTS_MOBILITY: "Gelenke & Mobilität",
  BEAUTY: "Beauty",
  SKINCARE: "Hautpflege",
  HAIR_REMOVAL: "Haarentfernung",
  WOMENS_PRODUCTS: "Frauenprodukte",
  PET_PRODUCTS: "Haustierprodukte",
  FASHION: "Mode",
  ELECTRONICS: "Elektronik",
  TOYS: "Spielzeug",
  OTHER: "Sonstiges",
};

export const MARKET_LABELS: Record<Market, string> = {
  DE: "Deutschland",
  AT: "Österreich",
  NL: "Niederlande",
  SE: "Schweden",
};

export const SOURCE_LABELS: Record<DataSource, string> = {
  FACEBOOK_ADS: "Facebook Ad Library",
  TIKTOK: "TikTok Creative Center",
  GOOGLE_TRENDS: "Google Trends",
  AMAZON: "Amazon Bestseller",
  ETSY: "Etsy",
  REDDIT: "Reddit",
  PINTEREST: "Pinterest",
  ALIEXPRESS: "AliExpress",
  CJ_DROPSHIPPING: "CJ Dropshipping",
  TEMU: "Temu",
  TRUSTPILOT: "Trustpilot",
  SIMILARWEB: "SimilarWeb",
  MANUAL: "Manuell",
};

export const PRIORITY_CATEGORIES: Category[] = [
  "HEALTH",
  "PAIN_RELIEF",
  "SLEEP",
  "COMFORT",
  "WELLNESS",
  "ANTI_SNORING",
  "BACK_NECK",
  "JOINTS_MOBILITY",
  "BEAUTY",
  "SKINCARE",
  "HAIR_REMOVAL",
  "WOMENS_PRODUCTS",
  "PET_PRODUCTS",
];
