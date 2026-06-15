export const dynamic = "force-dynamic";

import prisma from "@/lib/db";
import StatsCard from "@/components/dashboard/StatsCard";
import TopProducts from "@/components/dashboard/TopProducts";
import AlertsWidget from "@/components/dashboard/AlertsWidget";
import { CATEGORY_LABELS } from "@/types";
import { startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";
import type { Category } from "@prisma/client";
import ScanButton from "@/components/ScanButton";

export const revalidate = 60; // Revalidate every minute

async function getDashboardData() {
  const now = new Date();

  const [
    totalProducts,
    newToday,
    avgScores,
    topWeek,
    topMonth,
    unreadAlerts,
    recentAlerts,
    risingCount,
    categoryBreakdown,
    lastScan,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),

    prisma.product.count({
      where: { isActive: true, createdAt: { gte: startOfDay(now) } },
    }),

    prisma.productScore.aggregate({
      _avg: {
        winnerScore: true,
        emotionalScore: true,
        metaAdsScore: true,
      },
    }),

    prisma.product.findMany({
      where: { isActive: true, createdAt: { gte: startOfWeek(now, { weekStartsOn: 1 }) } },
      include: { scores: true },
      orderBy: { scores: { winnerScore: "desc" } },
      take: 10,
    }),

    prisma.product.findMany({
      where: { isActive: true, createdAt: { gte: startOfMonth(now) } },
      include: { scores: true },
      orderBy: { scores: { winnerScore: "desc" } },
      take: 10,
    }),

    prisma.alert.count({ where: { isRead: false } }),

    prisma.alert.findMany({
      where: { isRead: false },
      include: {
        product: { select: { id: true, name: true, category: true } },
      },
      orderBy: { triggeredAt: "desc" },
      take: 5,
    }),

    prisma.productTrend.count({
      where: {
        direction: "RISING",
        date: { gte: subDays(now, 7) },
      },
    }),

    prisma.product.groupBy({
      by: ["category"],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),

    prisma.scanLog.findFirst({
      orderBy: { startedAt: "desc" },
    }),
  ]);

  return {
    totalProducts,
    newToday,
    avgScores,
    topWeek,
    topMonth,
    unreadAlerts,
    recentAlerts,
    risingCount,
    categoryBreakdown,
    lastScan,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const avgWinner = Math.round(data.avgScores._avg.winnerScore ?? 0);
  const avgMeta = Math.round(data.avgScores._avg.metaAdsScore ?? 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Täglich aktualisierte Produktanalyse für DE · AT · NL · SE
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.lastScan && (
            <div className="text-right">
              <div className="text-xs text-slate-500">Letzter Scan</div>
              <div className="text-xs text-slate-400">
                {new Date(data.lastScan.startedAt).toLocaleString("de-AT", {
                  day: "2-digit", month: "2-digit",
                  hour: "2-digit", minute: "2-digit",
                })}
              </div>
            </div>
          )}
          <ScanButton />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Produkte gesamt"
          value={data.totalProducts}
          icon="📦"
          subtitle={`+${data.newToday} heute`}
          color="blue"
        />
        <StatsCard
          title="Ø Winner Score"
          value={avgWinner}
          icon="🏆"
          subtitle="Alle Produkte"
          color="green"
        />
        <StatsCard
          title="Ø Meta Ads Score"
          value={avgMeta}
          icon="📣"
          subtitle="Werbepotenzial"
          color="purple"
        />
        <StatsCard
          title="Offene Alerts"
          value={data.unreadAlerts}
          icon="🔔"
          subtitle={`${data.risingCount} steigende Trends`}
          color={data.unreadAlerts > 0 ? "red" : "green"}
        />
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-5 gap-3">
        {data.categoryBreakdown.map((cat) => (
          <div key={cat.category} className="card px-4 py-3 text-center">
            <div className="text-white font-bold text-xl">{cat._count.id}</div>
            <div className="text-slate-400 text-xs mt-1 truncate">
              {CATEGORY_LABELS[cat.category as Category] ?? cat.category}
            </div>
          </div>
        ))}
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopProducts
          title="🏆 Top 10 diese Woche"
          products={data.topWeek}
          emptyMessage="Diese Woche noch keine Produkte gefunden"
        />
        <TopProducts
          title="📅 Top 10 diesen Monat"
          products={data.topMonth}
          emptyMessage="Diesen Monat noch keine Produkte gefunden"
        />
      </div>

      {/* Alerts */}
      <AlertsWidget alerts={data.recentAlerts} />
    </div>
  );
}
