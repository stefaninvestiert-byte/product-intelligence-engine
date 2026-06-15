"use client";

import Link from "next/link";
import { ScoreBadge } from "@/components/ui/ScoreBar";
import { CATEGORY_LABELS } from "@/types";
import type { Product, ProductScore, Category } from "@prisma/client";

type TopProductItem = Product & { scores: ProductScore | null };

type TopProductsProps = {
  title: string;
  products: TopProductItem[];
  emptyMessage?: string;
};

export default function TopProducts({ title, products, emptyMessage }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-bold text-base mb-4">{title}</h3>
        <div className="text-center py-8 text-slate-500">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-sm">{emptyMessage ?? "Noch keine Produkte"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700">
        <h3 className="text-white font-bold text-base">{title}</h3>
      </div>
      <div className="divide-y divide-slate-700/50">
        {products.slice(0, 10).map((p, i) => {
          const winnerScore = p.scores?.winnerScore ?? 0;
          const metaScore = p.scores?.metaAdsScore ?? 0;
          const emotionalScore = p.scores?.emotionalScore ?? 0;

          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="flex items-center gap-4 px-5 py-3 hover:bg-slate-700/50 transition-colors group"
            >
              {/* Rank */}
              <div className="w-6 text-center">
                <span className={`text-sm font-bold ${i < 3 ? "text-yellow-400" : "text-slate-500"}`}>
                  {i + 1}
                </span>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate group-hover:text-blue-400 transition-colors">
                  {p.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-slate-500 text-xs">
                    {CATEGORY_LABELS[p.category as Category] ?? p.category}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-green-400 text-xs font-semibold">
                    {p.margin.toFixed(0)}% Marge
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-400 text-xs">
                    {p.sellPrice.toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Mini Scores */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-center">
                  <div className="text-purple-400 text-xs font-semibold">{metaScore.toFixed(0)}</div>
                  <div className="text-slate-600 text-xs">Meta</div>
                </div>
                <div className="text-center">
                  <div className="text-pink-400 text-xs font-semibold">{emotionalScore.toFixed(0)}</div>
                  <div className="text-slate-600 text-xs">Emotion</div>
                </div>
              </div>

              {/* Winner Score */}
              <ScoreBadge score={winnerScore} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
