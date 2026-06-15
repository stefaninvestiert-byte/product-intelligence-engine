import prisma from "@/lib/db";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/types";
import type { Category } from "@prisma/client";

export const revalidate = 300;

export default async function CompetitorsPage() {
  const competitors = await prisma.competitor.findMany({
    include: {
      product: {
        select: { id: true, name: true, category: true, sellPrice: true },
      },
    },
    orderBy: { adCount: "desc" },
    take: 50,
  });

  const topShops = await prisma.competitor.groupBy({
    by: ["shopName"],
    _sum: { adCount: true },
    _count: { productId: true },
    orderBy: { _sum: { adCount: "desc" } },
    take: 10,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Konkurrenz-Analyse</h1>
        <p className="text-slate-400 text-sm">Wer verkauft was, wie viel und mit welchen Ads</p>
      </div>

      {/* Top Shops */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="text-white font-bold">🏪 Aktivste Konkurrenten</h3>
        </div>
        {topShops.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            Noch keine Konkurrenzdata gesammelt. Starten Sie einen Scan.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 divide-x divide-slate-700">
            {topShops.map((shop) => (
              <div key={shop.shopName} className="p-4 text-center">
                <div className="text-white font-bold text-sm truncate">{shop.shopName}</div>
                <div className="text-orange-400 font-black text-xl mt-1">{shop._sum.adCount ?? 0}</div>
                <div className="text-slate-500 text-xs">Anzeigen</div>
                <div className="text-slate-400 text-xs mt-1">{shop._count.productId} Produkte</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Competitors */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="text-white font-bold">⚔️ Alle Konkurrenten</h3>
        </div>
        {competitors.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm">Noch keine Konkurrenzdata vorhanden</div>
            <div className="text-xs text-slate-600 mt-1">
              Starten Sie einen täglichen Scan, um Konkurrenten zu entdecken
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/30">
                  <th className="text-left px-5 py-3 text-slate-400 font-semibold">Produkt</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-semibold">Konkurrent</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-semibold">Preis</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-semibold">Anzeigen</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-semibold">Markt</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-semibold">Erste Anzeige</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {competitors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="px-5 py-3">
                      <Link
                        href={`/products/${c.product.id}`}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        {c.product.name}
                      </Link>
                      <div className="text-slate-500 text-xs">
                        {CATEGORY_LABELS[c.product.category as Category] ?? c.product.category}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-semibold">{c.shopName}</div>
                      {c.shopUrl && (
                        <a
                          href={c.shopUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-xs hover:text-blue-300"
                        >
                          Shop ansehen →
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-cyan-400 font-bold">{c.price.toFixed(2)}€</span>
                      {c.product.sellPrice && (
                        <div className="text-slate-500 text-xs">
                          Unser: {c.product.sellPrice.toFixed(2)}€
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge font-bold ${
                        c.adCount > 50 ? "bg-red-900/50 text-red-300" :
                        c.adCount > 20 ? "bg-orange-900/50 text-orange-300" :
                        "bg-slate-700 text-slate-300"
                      }`}>
                        {c.adCount} Ads
                      </span>
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
        )}
      </div>
    </div>
  );
}
