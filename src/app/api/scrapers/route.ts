import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { runDailyScan } from "@/lib/scrapers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source } = body;

    // Log scan start
    const scanLog = await prisma.scanLog.create({
      data: {
        source: source ?? "MANUAL",
        status: "RUNNING",
      },
    });

    const start = Date.now();

    try {
      const result = await runDailyScan();

      await prisma.scanLog.update({
        where: { id: scanLog.id },
        data: {
          status: result.errors.length > 0 ? "PARTIAL" : "COMPLETED",
          completedAt: new Date(),
          productsFound: result.total,
          productsNew: result.newProducts,
          errors: result.errors,
          duration: Math.round((Date.now() - start) / 1000),
        },
      });

      return NextResponse.json({
        message: "Scan abgeschlossen",
        ...result,
        duration: Math.round((Date.now() - start) / 1000),
      });
    } catch (err) {
      await prisma.scanLog.update({
        where: { id: scanLog.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          errors: [err instanceof Error ? err.message : String(err)],
          duration: Math.round((Date.now() - start) / 1000),
        },
      });
      throw err;
    }
  } catch (error) {
    console.error("POST /api/scrapers error:", error);
    return NextResponse.json({ error: "Scan fehlgeschlagen" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const logs = await prisma.scanLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("GET /api/scrapers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
