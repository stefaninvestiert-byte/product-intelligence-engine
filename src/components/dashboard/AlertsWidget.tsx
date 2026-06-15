"use client";

import Link from "next/link";
import type { Alert, Product } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

type AlertWithProduct = Alert & {
  product: Pick<Product, "id" | "name" | "category"> | null;
};

type AlertsWidgetProps = {
  alerts: AlertWithProduct[];
};

const ALERT_ICONS: Record<string, string> = {
  WINNER_SCORE_HIGH: "🏆",
  TREND_SPIKE: "📈",
  SEARCH_VOLUME_SURGE: "🔥",
  AD_SCALING: "📣",
  NEW_COMPETITOR: "⚔️",
  PRICE_DROP: "💰",
  SYSTEM: "⚙️",
};

const SEVERITY_COLORS: Record<string, string> = {
  INFO: "border-blue-500/30 bg-blue-900/20",
  WARNING: "border-yellow-500/30 bg-yellow-900/20",
  HIGH: "border-orange-500/30 bg-orange-900/20",
  CRITICAL: "border-red-500/30 bg-red-900/20",
};

export default function AlertsWidget({ alerts }: AlertsWidgetProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-bold text-base mb-4">Aktuelle Alerts</h3>
        <div className="text-center py-6 text-slate-500">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-sm">Keine neuen Alerts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-white font-bold text-base">Aktuelle Alerts</h3>
        <Link
          href="/alerts"
          className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
        >
          Alle anzeigen →
        </Link>
      </div>
      <div className="divide-y divide-slate-700/50">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 px-5 py-3 border-l-2 ${SEVERITY_COLORS[alert.severity]}`}
          >
            <span className="text-lg mt-0.5 flex-shrink-0">
              {ALERT_ICONS[alert.type] ?? "❓"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold">{alert.title}</div>
              <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">{alert.message}</div>
              <div className="text-slate-600 text-xs mt-1">
                {formatDistanceToNow(new Date(alert.triggeredAt), {
                  addSuffix: true,
                  locale: de,
                })}
              </div>
            </div>
            {alert.product && (
              <Link
                href={`/products/${alert.product.id}`}
                className="text-blue-400 text-xs hover:text-blue-300 flex-shrink-0"
              >
                Ansehen
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
