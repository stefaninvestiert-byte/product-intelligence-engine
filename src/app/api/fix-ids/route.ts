import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== "Bearer fix-ids-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { id: { contains: "&" } },
  });

  const results = [];
  for (const product of products) {
    const newId = product.id.replace(/&/g, "und").replace(/--+/g, "-");

    await prisma.productTrend.updateMany({
      where: { productId: product.id },
      data: { productId: newId },
    });

    const { id: _id, ...rest } = product;
    await prisma.product.create({ data: { ...rest, id: newId } });
    await prisma.product.delete({ where: { id: product.id } });

    results.push({ old: product.id, new: newId });
  }

  return NextResponse.json({ fixed: results.length, results });
}
