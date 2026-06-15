export const dynamic = "force-dynamic";

import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailView from "./ProductDetailView";

type Params = { params: { id: string } };

export default async function ProductDetailPage({ params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      scores: true,
      recommendations: true,
      marketData: true,
      competitors: { orderBy: { adCount: "desc" } },
      alerts: { orderBy: { triggeredAt: "desc" }, take: 5 },
    },
  });

  if (!product) notFound();

  // Serialize: converts Prisma Decimal → number so it's passable to Client Component
  return <ProductDetailView product={JSON.parse(JSON.stringify(product))} />;
}
