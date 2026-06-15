import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { runDailyScan } from "@/lib/scrapers";

// Called daily by Vercel Cron at 06:00 UTC
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/daily-scan", "schedule": "0 6 * * *" }] }
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scanLog = await prisma.scanLog.create({
    data: { source: "MANUAL", status: "RUNNING" },
  });

  try {
    const start = Date.now();
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

    // Create system alert for daily report
    await prisma.alert.create({
      data: {
        type: "SYSTEM",
        severity: "INFO",
        title: "Täglicher Scan abgeschlossen",
        message: `${result.total} Produkte geprüft, ${result.newProducts} neu entdeckt. ${result.errors.length} Fehler aufgetreten.`,
        data: result,
      },
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    await prisma.scanLog.update({
      where: { id: scanLog.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errors: [err instanceof Error ? err.message : String(err)],
      },
    });

    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
