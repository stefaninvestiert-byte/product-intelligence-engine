import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    const [
      totalProducts,
      newToday,
      newThisWeek,
      newThisMonth,
      avgScores,
      topToday,
      topWeek,
      topMonth,
      unreadAlerts,
      recentAlerts,
      risingTrends,
      categoryBreakdown,
      marginStats,
      lastScan,
    ] = await Promise.all([
      // Total active products
      prisma.product.count({ where: { isActive: true } }),

      // New products today
      prisma.product.count({
        where: { isActive: true, createdAt: { gte: todayStart } },
      }),

      // New products this week
      prisma.product.count({
        where: { isActive: true, createdAt: { gte: weekStart } },
      }),

      // New products this month
      prisma.product.count({
        where: { isActive: true, createdAt: { gte: monthStart } },
      }),

      // Average scores
      prisma.productScore.aggregate({
        _avg: {
          winnerScore: true,
          emotionalScore: true,
          metaAdsScore: true,
          googleAdsScore: true,
          conversionScore: true,
        },
      }),

      // Top 10 today
      prisma.product.findMany({
        where: { isActive: true, createdAt: { gte: todayStart } },
        include: { scores: true },
        orderBy: { scores: { winnerScore: "desc" } },
        take: 10,
      }),

      // Top 10 this week
      prisma.product.findMany({
        where: { isActive: true, createdAt: { gte: weekStart } },
        include: { scores: true },
        orderBy: { scores: { winnerScore: "desc" } },
        take: 10,
      }),

      // Top 10 this month
      prisma.product.findMany({
        where: { isActive: true, createdAt: { gte: monthStart } },
        include: { scores: true },
        orderBy: { scores: { winnerScore: "desc" } },
        take: 10,
      }),

      // Unread alert count
      prisma.alert.count({ where: { isRead: false } }),

      // Recent alerts
      prisma.alert.findMany({
        where: { isRead: false },
        include: {
          product: { select: { id: true, name: true, category: true } },
        },
        orderBy: { triggeredAt: "desc" },
        take: 5,
      }),

      // Rising trends
      prisma.productTrend.findMany({
        where: {
          direction: "RISING",
          date: { gte: subDays(now, 7) },
        },
        include: {
          product: { select: { id: true, name: true, category: true } },
        },
        orderBy: { percentChange: "desc" },
        take: 5,
        distinct: ["productId"],
      }),

      // Category breakdown
      prisma.product.groupBy({
        by: ["category"],
        where: { isActive: true },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Margin statistics
      prisma.product.aggregate({
        where: { isActive: true },
        _avg: { margin: true, marginAbsolute: true },
        _max: { margin: true, winnerScore: undefined },
      }),

      // Last scan log
      prisma.scanLog.findFirst({
        orderBy: { startedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalProducts,
        newToday,
        newThisWeek,
        newThisMonth,
        avgWinnerScore: Math.round(avgScores._avg.winnerScore ?? 0),
        avgMargin: Math.round(marginStats._avg.margin ?? 0),
        unreadAlerts,
      },
      topToday,
      topWeek,
      topMonth,
      recentAlerts,
      risingTrends,
      categoryBreakdown,
      lastScan,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
