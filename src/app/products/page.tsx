"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ScoreBar, { ScoreBadge } from "@/components/ui/ScoreBar";
import { CATEGORY_LABELS } from "@/types";
import type { Product, ProductScore, Category } from "@prisma/client";

type ProductListItem = Product & {
  scores: ProductScore | null;
  _count: { competitors: number; alerts: number };
};

const CATEGORIES = Object.entries(CATEGORY_LABELS);

function ScorePill({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
    score >= 60 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
    "bg-red-500/20 text-red-400 border-red-500/30";
  return (
    <div className={`inline-flex flex-col items-center px-2 py-1 rounded border text-xs font-semibold ${color}`}>
      <span>{score}</span>
      <span className="text-[10px] font-normal opacity-70">{label}</span>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minWinnerScore, setMinWinnerScore] = useState(0);
  const [minMargin, setMinMargin] = useState(0);
  const [minCompetitionScore, setMinCompetitionScore] = useState(0);
  const [minProblemSolvingScore, setMinProblemSolvingScore] = useState(0);
  const [winnerFilterActive, setWinnerFilterActive] = useState(false);
  const [sortBy, setSortBy] = useState("winnerScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [addingProduct, setAddingProduct] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Toggle default Winner-Filter: Winner>80 AND Competition>70 AND ProblemSolving>80
  const toggleWinnerFilter = () => {
    if (!winnerFilterActive) {
      setMinWinnerScore(80);
      setMinCompetitionScore(70);
      setMinProblemSolvingScore(80);
      setWinnerFilterActive(true);
    } else {
      setMinWinnerScore(0);
      setMinCompetitionScore(0);
      setMinProblemSolvingScore(0);
      setWinnerFilterActive(false);
    }
    setPage(1);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      sortBy,
      sortDir,
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
      ...(minWinnerScore > 0 ? { minWinnerScore: String(minWinnerScore) } : {}),
      ...(minMargin > 0 ? { minMargin: String(minMargin) } : {}),
      ...(minCompetitionScore > 0 ? { minCompetitionScore: String(minCompetitionScore) } : {}),
      ...(minProblemSolvingScore > 0 ? { minProblemSolvingScore: String(minProblemSolvingScore) } : {}),
    });

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, minWinnerScore, minMargin, minCompetitionScore, minProblemSolvingScore, sortBy, sortDir]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddingProduct(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      description: fd.get("description"),
      category: fd.get("category"),
      buyPrice: parseFloat(fd.get("buyPrice") as string),
      sellPrice: parseFloat(fd.get("sellPrice") as string),
      sourceUrl: fd.get("sourceUrl"),
      targetMarkets: ["DE", "AT", "NL", "SE"],
    };
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setShowAddForm(false);
      fetchProducts();
    } finally {
      setAddingProduct(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Produktdatenbank</h1>
          <p className="text-slate-400 text-sm">{total} Produkte · KI-bewertet</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={toggleWinnerFilter}
            className={`btn-${winnerFilterActive ? "primary" : "secondary"} flex items-center gap-2`}
          >
            🏆 {winnerFilterActive ? "Winner-Filter aktiv" : "Winner-Filter"}
          </button>
          <button
            onClick={() => fetch("/api/analysis", { method: "GET" })}
            className="btn-secondary"
          >
            ⚡ Alle analysieren
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            + Produkt hinzufügen
          </button>
        </div>
      </div>

      {/* Winner Filter Info Bar */}
      {winnerFilterActive && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-3 text-sm text-emerald-300 flex items-center gap-3">
          <span className="text-lg">🏆</span>
          <span>
            <strong>Winner-Filter aktiv:</strong> Winner Score &gt; 80 · Competition Score &gt; 70 · Problem Solving Score &gt; 80
          </span>
          <button onClick={toggleWinnerFilter} className="ml-auto text-emerald-400 hover:text-emerald-200 text-xs underline">
            zurücksetzen
          </button>
        </div>
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-white font-bold text-lg mb-4">Neues Produkt hinzufügen</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase mb-1 block">Produktname *</label>
                <input name="name" required className="input w-full" placeholder="z.B. Anti-Schnarchen Nasenspreizer" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase mb-1 block">Beschreibung</label>
                <textarea name="description" rows={3} className="input w-full resize-none" placeholder="Kurze Produktbeschreibung..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-semibold uppercase mb-1 block">Kategorie *</label>
                  <select name="category" required className="select w-full">
                    {CATEGORIES.map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold uppercase mb-1 block">Quelle URL</label>
                  <input name="sourceUrl" className="input w-full" placeholder="https://..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-semibold uppercase mb-1 block">Einkaufspreis (€) *</label>
                  <input name="buyPrice" type="number" step="0.01" required className="input w-full" placeholder="8.99" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold uppercase mb-1 block">Verkaufspreis (€) *</label>
                  <input name="sellPrice" type="number" step="0.01" required className="input w-full" placeholder="39.99" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addingProduct} className="btn-primary flex-1">
                  {addingProduct ? "⏳ KI analysiert..." : "✨ Speichern & Analysieren"}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary flex-1">
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
        <input
          className="input col-span-2 md:col-span-1"
          placeholder="🔍 Suchen..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="select"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">Alle Kategorien</option>
          {CATEGORIES.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <div>
          <label className="text-slate-500 text-xs mb-1 block">Winner ≥ {minWinnerScore}</label>
          <input
            type="range" min="0" max="100" step="5"
            value={minWinnerScore}
            onChange={(e) => { setMinWinnerScore(parseInt(e.target.value)); setWinnerFilterActive(false); setPage(1); }}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-500 text-xs mb-1 block">Problem Solving ≥ {minProblemSolvingScore}</label>
          <input
            type="range" min="0" max="100" step="5"
            value={minProblemSolvingScore}
            onChange={(e) => { setMinProblemSolvingScore(parseInt(e.target.value)); setWinnerFilterActive(false); setPage(1); }}
            className="w-full accent-purple-500"
          />
        </div>
        <div>
          <label className="text-slate-500 text-xs mb-1 block">Competition ≥ {minCompetitionScore}</label>
          <input
            type="range" min="0" max="100" step="5"
            value={minCompetitionScore}
            onChange={(e) => { setMinCompetitionScore(parseInt(e.target.value)); setWinnerFilterActive(false); setPage(1); }}
            className="w-full accent-orange-500"
          />
        </div>
        <select
          className="select"
          value={`${sortBy}-${sortDir}`}
          onChange={(e) => {
            const [sb, sd] = e.target.value.split("-");
            setSortBy(sb);
            setSortDir(sd as "asc" | "desc");
          }}
        >
          <option value="winnerScore-desc">Winner Score ↓</option>
          <option value="problemSolvingScore-desc">Problem Solving ↓</option>
          <option value="competitionScore-desc">Competition ↓</option>
          <option value="demandScore-desc">Demand ↓</option>
          <option value="profitScore-desc">Profit ↓</option>
          <option value="margin-desc">Marge ↓</option>
          <option value="emotionalScore-desc">Emotional Score ↓</option>
          <option value="metaAdsScore-desc">Meta Score ↓</option>
          <option value="createdAt-desc">Neueste zuerst</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="text-4xl mb-3">⏳</div>
            <div>Lade Produkte...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <div>Keine Produkte gefunden</div>
            {winnerFilterActive && (
              <p className="text-xs mt-2 text-slate-600">
                Winner-Filter ist aktiv — keine Produkte erfüllen alle 3 Kriterien noch.<br />
                Produkte analysieren lassen, damit Scores berechnet werden.
              </p>
            )}
            <button
              onClick={() => fetch("/api/scrapers", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })}
              className="mt-4 btn-primary"
            >
              Jetzt scannen
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="text-left px-5 py-3 text-slate-400 font-semibold">Produkt</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-semibold">Winner</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-semibold whitespace-nowrap">Problem<br/>Solving</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-semibold">Competition</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-semibold">Demand</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-semibold">Profit</th>
                    <th className="text-center px-3 py-3 text-slate-400 font-semibold">Meta</th>
                    <th className="text-right px-3 py-3 text-slate-400 font-semibold">Marge</th>
                    <th className="text-right px-5 py-3 text-slate-400 font-semibold">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {products.map((p) => {
                    const s = p.scores;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-slate-500 text-xs mt-0.5">
                            {CATEGORY_LABELS[p.category as Category] ?? p.category}
                            {" · "}
                            {p.sellPrice.toFixed(2)}€
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <ScoreBadge score={s?.winnerScore ?? 0} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <ScorePill score={s?.problemSolvingScore ?? 0} label="PS" />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <ScorePill score={s?.competitionScore ?? 0} label="Comp" />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <ScorePill score={s?.demandScore ?? 0} label="Demand" />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <ScorePill score={s?.profitScore ?? 0} label="Profit" />
                        </td>
                        <td className="px-3 py-3">
                          <ScoreBar score={s?.metaAdsScore ?? 0} size="sm" />
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className="text-green-400 font-bold">{p.margin.toFixed(0)}%</span>
                          <div className="text-cyan-400 text-xs">{p.marginAbsolute.toFixed(2)}€</div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/products/${p.id}`}
                            className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                          >
                            Details →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-700 flex items-center justify-between">
                <span className="text-slate-500 text-sm">{total} Produkte total</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary py-1 px-3 disabled:opacity-40"
                  >
                    ← Zurück
                  </button>
                  <span className="text-slate-400 text-sm flex items-center px-3">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary py-1 px-3 disabled:opacity-40"
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
