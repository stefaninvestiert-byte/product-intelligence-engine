import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const alerts = await prisma.alert.findMany({
      where: unreadOnly ? { isRead: false } : {},
      include: {
        product: {
          select: { id: true, name: true, category: true, imageUrl: true },
        },
      },
      orderBy: { triggeredAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.alert.count({ where: { isRead: false } });

    return NextResponse.json({ alerts, unreadCount });
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertIds, markAllRead } = body;

    if (markAllRead) {
      await prisma.alert.updateMany({
        where: { isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return NextResponse.json({ message: "Alle Alerts als gelesen markiert" });
    }

    if (alertIds && Array.isArray(alertIds)) {
      await prisma.alert.updateMany({
        where: { id: { in: alertIds } },
        data: { isRead: true, readAt: new Date() },
      });
      return NextResponse.json({ message: `${alertIds.length} Alerts gelesen` });
    }

    return NextResponse.json({ error: "alertIds oder markAllRead erforderlich" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/alerts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
