# Product Intelligence Engine — Setup Guide

## Schnellstart (5 Minuten)

### 1. Dependencies installieren

```bash
cd product-intelligence-engine
npm install
```

### 2. Datenbank einrichten

**Option A: Neon (empfohlen, kostenlos)**
1. https://neon.tech → Kostenloses Konto erstellen
2. Neue Datenbank erstellen → Connection String kopieren

**Option B: Supabase**
1. https://supabase.com → Kostenloses Konto
2. Settings → Database → Connection string (Pooler Mode)

**Option C: Lokal (PostgreSQL)**
```bash
# Windows: PostgreSQL installieren von postgresql.org
createdb product_intelligence
```

### 3. Environment Variables konfigurieren

```bash
# .env.example → .env.local kopieren
cp .env.example .env.local
```

Dann in `.env.local` ausfüllen:
```env
DATABASE_URL="postgresql://..."          # Neon/Supabase URL
ANTHROPIC_API_KEY="sk-ant-..."          # https://console.anthropic.com/
CRON_SECRET="dein-geheimer-key-123"
```

### 4. Datenbankschema erstellen

```bash
npm run db:push        # Schema in DB pushen
npm run db:seed        # 10 Testprodukte laden (optional)
```

### 5. App starten

```bash
npm run dev
# → http://localhost:3000
```

---

## Erste Schritte in der App

### Dashboard
- Übersicht aller KPIs
- Top Produkte der Woche/des Monats
- Aktuelle Alerts

### Erster Scan
1. Sidebar → "Scan starten" klicken
2. Oder: `POST /api/scrapers` aufrufen
3. Warten bis Scan abgeschlossen

### KI-Analyse starten
1. Produkte-Seite → "Alle analysieren"
2. Oder einzelnes Produkt → "Neu analysieren"
3. Claude analysiert automatisch und vergibt Scores

---

## Deployment auf Vercel

```bash
npm install -g vercel
vercel

# Environment Variables in Vercel Dashboard setzen:
# DATABASE_URL, ANTHROPIC_API_KEY, CRON_SECRET

# Cron Job wird automatisch eingerichtet (vercel.json)
# → Täglich um 06:00 UTC: automatischer Produktscan
```

---

## Technologie-Stack

| Komponente | Technologie |
|-----------|-------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Datenbank | PostgreSQL + Prisma ORM |
| KI | Claude API (claude-sonnet-4-6) |
| Charts | Recharts |
| Export | ExcelJS (xlsx) |
| Scraping | Axios + Cheerio + Puppeteer |
| Cron | Vercel Cron |

---

## Score-System Übersicht

### Winner Score (0-100)
Gewichtetes Composite aus:
- Emotional Score: 25%
- Meta Ads Score: 20%
- Google Ads Score: 15%
- Gewinnmarge: 20%
- Konkurrenz-Level: 10%
- Skalierbarkeit: 10%

### Bewertungsskala
- 85-100: 🏆 Top Winner → Sofort handeln
- 70-84: ⭐ Sehr gut → Testen empfohlen
- 55-69: 👍 Gut → Prüfenswert
- 40-54: ⚡ Mittel → Weiter beobachten
- 0-39: ⚠️ Schwach → Nicht empfohlen

---

## Datenquellen Integration

Aktuell mit Seed-Daten. Für echte Daten:

| Quelle | API | Kosten |
|--------|-----|--------|
| Google Trends | SerpAPI | ~$50/Mo |
| Facebook Ads | Marketing API | Kostenlos |
| Amazon | PA-API | Kostenlos (min. Sales) |
| Reddit | Reddit API | Kostenlos |
| AliExpress | Affiliate API | Kostenlos |
| TikTok | TikTok for Business | Kostenlos |

---

## Lizenz
Proprietär — Nur für den internen Gebrauch
