import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import ScoreBar, { ScoreBadge } from "@/components/ui/ScoreBar";
import { CATEGORY_LABELS, SOURCE_LABELS, MARKET_LABELS } from "@/types";
import ProductActions from "@/components/products/ProductActions";
import CopyableItem, { CopyablePrimaryText } from "@/components/products/CopyableItem";
import type { Category, Market, DataSource } from "@prisma/client";

type Params = { params: { id: string } };

export default async function ProductDetailPage({ params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      scores: true,
      recommendations: true,
      marketData: true,
      competitors: { orderBy: { adCount: "desc" } },
      alerts: { orderBy: { triggeredAt: "desc" }, take: 5 },
    },
  });

  if (!product) notFound();

  const s = product.scores;
  const r = product.recommendations;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-500 text-sm mb-1">
            {CATEGORY_LABELS[product.category as Category] ?? product.category}
            {" · "}
            {SOURCE_LABELS[product.sourcePlatform as DataSource]}
          </div>
          <h1 className="text-3xl font-black text-white">{product.name}</h1>
          <p className="text-slate-400 mt-2 max-w-2xl">{product.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {(product.targetMarkets as Market[]).map((m) => (
              <span key={m} className="badge bg-slate-700 text-slate-300">
                {MARKET_LABELS[m] ?? m}
              </span>
            ))}
          </div>
        </div>
        {s && <ScoreBadge score={s.winnerScore} />}
      </div>

      {/* Pricing + Margin */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-slate-500 text-xs mb-1">Einkaufspreis</div>
          <div className="text-white text-2xl font-black">{product.buyPrice.toFixed(2)}€</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-slate-500 text-xs mb-1">Verkaufspreis</div>
          <div className="text-cyan-400 text-2xl font-black">{product.sellPrice.toFixed(2)}€</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-slate-500 text-xs mb-1">Gewinnmarge</div>
          <div className="text-green-400 text-2xl font-black">{product.margin.toFixed(1)}%</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-slate-500 text-xs mb-1">Gewinn/Stück</div>
          <div className="text-emerald-400 text-2xl font-black">{product.marginAbsolute.toFixed(2)}€</div>
        </div>
      </div>

      {/* Winner Score Übersicht */}
      {s && (
        <div className="card p-5">
          <h3 className="text-white font-bold mb-4">🏆 Score-Übersicht</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-3xl font-black text-yellow-400">{Math.round(s.winnerScore)}</div>
              <div className="text-yellow-300 text-sm font-semibold mt-1">Winner Score</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
              <div className="text-3xl font-black text-pink-400">{Math.round(s.emotionalScore)}</div>
              <div className="text-pink-300 text-sm font-semibold mt-1">Emotional</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-3xl font-black text-purple-400">{Math.round(s.metaAdsScore)}</div>
              <div className="text-purple-300 text-sm font-semibold mt-1">Meta Ads</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-3xl font-black text-blue-400">{Math.round(s.googleAdsScore)}</div>
              <div className="text-blue-300 text-sm font-semibold mt-1">Google Ads</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-3xl font-black text-cyan-400">{Math.round(s.conversionScore)}</div>
              <div className="text-cyan-300 text-sm font-semibold mt-1">Conversion</div>
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdowns */}
      {s && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emotional Score */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Emotional Score</h3>
              <ScoreBadge score={s.emotionalScore} />
            </div>
            <div className="space-y-2.5">
              <ScoreBar score={s.painRelief} label="Schmerzlinderung" size="sm" />
              <ScoreBar score={s.shame} label="Scham / Unsicherheit" size="sm" />
              <ScoreBar score={s.anxiety} label="Angst / Sorge" size="sm" />
              <ScoreBar score={s.comfort} label="Komfort / Bequemlichkeit" size="sm" />
              <ScoreBar score={s.attractiveness} label="Attraktivität" size="sm" />
              <ScoreBar score={s.timeSaving} label="Zeitersparnis" size="sm" />
              <ScoreBar score={s.selfConfidence} label="Selbstbewusstsein" size="sm" />
              <ScoreBar score={s.health} label="Gesundheit" size="sm" />
            </div>
          </div>

          {/* Meta Ads Score */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Meta Ads Score</h3>
              <ScoreBadge score={s.metaAdsScore} />
            </div>
            <div className="space-y-2.5">
              <ScoreBar score={s.ugcPotential} label="UGC-Potenzial" size="sm" />
              <ScoreBar score={s.hookPotential} label="Hook-Potenzial" size="sm" />
              <ScoreBar score={s.scrollStopper} label="Scrollstopper" size="sm" />
              <ScoreBar score={s.creativePotential} label="Kreativpotenzial" size="sm" />
              <ScoreBar score={100 - s.beforeAfterRisk} label="Vorher-Nachher Sicherheit" size="sm" />
              <ScoreBar score={100 - s.complianceRisk} label="Compliance-Sicherheit" size="sm" />
            </div>
          </div>

          {/* Google Ads Score */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Google Ads Score</h3>
              <ScoreBadge score={s.googleAdsScore} />
            </div>
            <div className="space-y-2.5">
              <ScoreBar score={s.searchIntent} label="Suchintention" size="sm" />
              <ScoreBar score={s.keywordPotential} label="Keyword-Potenzial" size="sm" />
              <ScoreBar score={s.buyingIntent} label="Kaufbereitschaft" size="sm" />
              <ScoreBar score={100 - s.cpcRisk} label="CPC-Effizienz" size="sm" />
              <ScoreBar score={s.competitionLevel} label="Wettbewerbs-Score" size="sm" />
            </div>
          </div>

          {/* Conversion Score */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Conversion Score</h3>
              <ScoreBadge score={s.conversionScore} />
            </div>
            <div className="space-y-2.5">
              <ScoreBar score={s.problemAwareness} label="Problembewusstsein" size="sm" />
              <ScoreBar score={s.solutionClarity} label="Lösungsklarheit" size="sm" />
              <ScoreBar score={s.trustPotential} label="Vertrauenspotenzial" size="sm" />
              <ScoreBar score={s.storytelling} label="Storytelling-Potenzial" size="sm" />
              <ScoreBar score={s.upsellPotential} label="Upsell-Potenzial" size="sm" />
              <ScoreBar score={s.bundlePotential} label="Bundle-Potenzial" size="sm" />
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {r && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar */}
          <div className="card p-5">
            <h3 className="text-white font-bold mb-3">🎯 Zielgruppe & Avatar</h3>
            <div className="space-y-3">
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Zielgruppe</div>
                <p className="text-slate-300 text-sm">{r.targetAudience}</p>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Avatar</div>
                <p className="text-slate-300 text-sm">{r.avatar}</p>
              </div>
              {r.demographics && (
                <div>
                  <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Demographisch</div>
                  <p className="text-slate-300 text-sm">{r.demographics}</p>
                </div>
              )}
              {r.psychographics && (
                <div>
                  <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Psychographisch</div>
                  <p className="text-slate-300 text-sm">{r.psychographics}</p>
                </div>
              )}
            </div>
          </div>

          {/* Kaufmotive & Werbewinkel */}
          <div className="card p-5">
            <h3 className="text-white font-bold mb-3">💡 Kaufmotive & Werbewinkel</h3>
            <div className="space-y-3">
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-2">Kaufmotive</div>
                <div className="flex flex-wrap gap-2">
                  {r.buyingMotives.map((m, i) => (
                    <span key={i} className="badge bg-blue-900/40 text-blue-300 border border-blue-500/30 text-xs px-3 py-1">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-2">Werbewinkel</div>
                <div className="space-y-1.5">
                  {r.adAngles.map((angle, i) => (
                    <div key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">→</span>
                      {angle}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hooks */}
          <div className="card p-5">
            <h3 className="text-white font-bold mb-3">🔥 Ad Hooks <span className="text-slate-500 text-xs font-normal">(Klicken zum Kopieren)</span></h3>
            <div className="space-y-2">
              {r.hooks.map((hook, i) => (
                <CopyableItem
                  key={i}
                  text={hook}
                  prefix={<span className="text-yellow-400 font-bold mr-2">#{i + 1}</span>}
                />
              ))}
            </div>
          </div>

          {/* Headlines */}
          <div className="card p-5">
            <h3 className="text-white font-bold mb-3">📰 Headlines <span className="text-slate-500 text-xs font-normal">(Klicken zum Kopieren)</span></h3>
            <div className="space-y-2">
              {r.headlines.map((h, i) => (
                <CopyableItem
                  key={i}
                  text={h}
                  prefix={<span className="text-purple-400 font-bold mr-2">#{i + 1}</span>}
                />
              ))}
            </div>
          </div>

          {/* Offers */}
          <div className="card p-5">
            <h3 className="text-white font-bold mb-3">🎁 Angebote & Bundles</h3>
            <div className="space-y-3">
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-2">Angebote</div>
                {r.offerIdeas.map((o, i) => (
                  <div key={i} className="text-slate-300 text-sm flex items-start gap-2 mb-1.5">
                    <span className="text-green-400">✓</span>{o}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-2">Bundle-Ideen</div>
                {r.bundleIdeas.map((b, i) => (
                  <div key={i} className="text-slate-300 text-sm flex items-start gap-2 mb-1.5">
                    <span className="text-cyan-400">📦</span>{b}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-2">Upsell-Ideen</div>
                {r.upsellIdeas.map((u, i) => (
                  <div key={i} className="text-slate-300 text-sm flex items-start gap-2 mb-1.5">
                    <span className="text-orange-400">↑</span>{u}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Text */}
          {r.primaryText && (
            <div className="card p-5">
              <h3 className="text-white font-bold mb-3">📣 Meta Ad Text <span className="text-slate-500 text-xs font-normal">(Klicken zum Kopieren)</span></h3>
              <CopyablePrimaryText text={r.primaryText} />
            </div>
          )}
        </div>
      )}

      {/* Competitors */}
      {product.competitors.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-white font-bold">⚔️ Konkurrenzanalyse</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/30">
                  <th className="text-left px-5 py-3 text-slate-400 font-semibold">Shop</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-semibold">Preis</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-semibold">Anzeigen</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-semibold">Markt</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-semibold">Erste Anzeige</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {product.competitors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="px-5 py-3">
                      <div className="text-white font-semibold">{c.shopName}</div>
                      {c.shopUrl && (
                        <a href={c.shopUrl} target="_blank" rel="noopener noreferrer"
                          className="text-blue-400 text-xs hover:text-blue-300">
                          {c.shopUrl}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-cyan-400 font-semibold">{c.price.toFixed(2)}€</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge bg-orange-900/40 text-orange-300">{c.adCount} Ads</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">{c.market}</td>
                    <td className="px-4 py-3 text-center text-slate-500">
                      {c.firstAdSeen
                        ? new Date(c.firstAdSeen).toLocaleDateString("de-AT")
                        : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <ProductActions productId={product.id} productName={product.name} />
    </div>
  );
}
