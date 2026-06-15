"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { de } from "date-fns/locale";
import type { Alert, Product } from "@prisma/client";

type AlertWithProduct = Alert & {
  product: Pick<Product, "id" | "name" | "category"> | null;
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

const SEVERITY_STYLES: Record<string, string> = {
  INFO: "border-l-blue-500 bg-blue-900/10",
  WARNING: "border-l-yellow-500 bg-yellow-900/10",
  HIGH: "border-l-orange-500 bg-orange-900/10",
  CRITICAL: "border-l-red-500 bg-red-900/10",
};

const SEVERITY_BADGE: Record<string, string> = {
  INFO: "bg-blue-900/50 text-blue-300",
  WARNING: "bg-yellow-900/50 text-yellow-300",
  HIGH: "bg-orange-900/50 text-orange-300",
  CRITICAL: "bg-red-900/50 text-red-300",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertWithProduct[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUnread, setShowUnread] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alerts?unread=${showUnread}&limit=100`);
      const data = await res.json();
      setAlerts(data.alerts ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [showUnread]);

  const markAllRead = async () => {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    fetchAlerts();
  };

  const markRead = async (id: string) => {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertIds: [id] }),
    });
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, isRead: true } : a));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Alert-Center</h1>
          <p className="text-slate-400 text-sm">
            {unreadCount > 0 ? `${unreadCount} ungelesene Alerts` : "Alle Alerts gelesen"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnread}
              onChange={(e) => setShowUnread(e.target.checked)}
              className="accent-blue-500 w-4 h-4"
            />
            Nur ungelesen
          </label>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-xs">
              Alle als gelesen markieren
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="text-4xl mb-3">⏳</div>
          <div>Lade Alerts...</div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card py-20 text-center text-slate-500">
          <div className="text-4xl mb-3">✅</div>
          <div>Keine Alerts vorhanden</div>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`card border-l-4 ${SEVERITY_STYLES[alert.severity]} ${
                !alert.isRead ? "ring-1 ring-white/10" : "opacity-70"
              }`}
            >
              <div className="p-4 flex items-start gap-4">
                <span className="text-2xl flex-shrink-0 mt-0.5">
                  {ALERT_ICONS[alert.type] ?? "❓"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold">{alert.title}</span>
                    <span className={`badge text-xs ${SEVERITY_BADGE[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    {!alert.isRead && (
                      <span className="badge bg-blue-600 text-white text-xs">NEU</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-slate-600 text-xs">
                      {format(new Date(alert.triggeredAt), "dd.MM.yyyy HH:mm")}
                      {" · "}
                      {formatDistanceToNow(new Date(alert.triggeredAt), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </span>
                    {alert.product && (
                      <Link
                        href={`/products/${alert.product.id}`}
                        className="text-blue-400 text-xs hover:text-blue-300"
                      >
                        → {alert.product.name}
                      </Link>
                    )}
                  </div>
                </div>
                {!alert.isRead && (
                  <button
                    onClick={() => markRead(alert.id)}
                    className="text-slate-500 hover:text-slate-300 text-xs flex-shrink-0"
                  >
                    ✓ Gelesen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
