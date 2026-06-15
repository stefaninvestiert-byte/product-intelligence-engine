"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/types";
import type { Category } from "@prisma/client";

type TrendItem = {
  id: string;
  date: string;
  productId: string;
  percentChange: number;
  searchVolume: number;
  trendScore: number;
  direction: string;
  market: string;
  product: { id: string; name: string; category: string };
};

export default function TrendsPage() {
  const [rising, setRising] = useState<TrendItem[]>([]);
  const [falling, setFalling] = useState<TrendItem[]>([]);
  const [spikes, setSpikes] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trends?days=${days}`)
      .then((r) => r.json())
      .then((d) => {
        setRising(d.rising ?? []);
        setFalling(d.falling ?? []);
        setSpikes(d.spikes ?? []);
      })
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Trend Monitor</h1>
          <p className="text-slate-400 text-sm">Echtzeit-Trendanalyse für DE · AT · NL · SE</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                days === d
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {d}T
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="text-4xl mb-3">📊</div>
          <div>Analysiere Trends...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rising */}
          <div className="card overflow-hidden">
            <div className="card-header flex items-center gap-2">
              <span className="text-green-400 text-lg">📈</span>
              <h3 className="text-white font-bold">Steigende Trends</h3>
              <span className="ml-auto badge bg-green-900/50 text-green-300">{rising.length}</span>
            </div>
            <div className="divide-y divide-slate-700/50">
              {rising.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Keine steigenden Trends
                </div>
              ) : rising.map((t) => (
                <Link
                  key={t.id}
                  href={`/products/${t.productId}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">
                      {t.product.name}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      {CATEGORY_LABELS[t.product.category as Category] ?? t.product.category}
                      {" · "}{t.market}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-green-400 font-bold text-sm">+{t.percentChange.toFixed(0)}%</div>
                    <div className="text-slate-500 text-xs">{t.searchVolume.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Spikes */}
          <div className="card overflow-hidden">
            <div className="card-header flex items-center gap-2">
              <span className="text-yellow-400 text-lg">⚡</span>
              <h3 className="text-white font-bold">Trend-Spikes</h3>
              <span className="ml-auto badge bg-yellow-900/50 text-yellow-300">{spikes.length}</span>
            </div>
            <div className="divide-y divide-slate-700/50">
              {spikes.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Keine aktuellen Spikes
                </div>
              ) : spikes.map((t) => (
                <Link
                  key={t.id}
                  href={`/products/${t.productId}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">
                      {t.product.name}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      {CATEGORY_LABELS[t.product.category as Category] ?? t.product.category}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-yellow-400 font-bold text-sm">⚡ +{t.percentChange.toFixed(0)}%</div>
                    <div className="text-slate-500 text-xs">Spike</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Falling */}
          <div className="card overflow-hidden">
            <div className="card-header flex items-center gap-2">
              <span className="text-red-400 text-lg">📉</span>
              <h3 className="text-white font-bold">Sinkende Trends</h3>
              <span className="ml-auto badge bg-red-900/50 text-red-300">{falling.length}</span>
            </div>
            <div className="divide-y divide-slate-700/50">
              {falling.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Keine sinkenden Trends
                </div>
              ) : falling.map((t) => (
                <Link
                  key={t.id}
                  href={`/products/${t.productId}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">
                      {t.product.name}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      {CATEGORY_LABELS[t.product.category as Category] ?? t.product.category}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-red-400 font-bold text-sm">{t.percentChange.toFixed(0)}%</div>
                    <div className="text-slate-500 text-xs">{t.searchVolume.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
