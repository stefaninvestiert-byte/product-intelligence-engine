"use client";

type ProductActionsProps = {
  productId: string;
  productName: string;
};

export default function ProductActions({ productId, productName }: ProductActionsProps) {
  const reanalyze = () =>
    fetch("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, force: true }),
    }).then(() => window.location.reload());

  const exportExcel = () =>
    fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "EXCEL", productIds: [productId] }),
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${productName}-${Date.now()}.xlsx`;
        a.click();
      });

  return (
    <div className="flex gap-3">
      <button onClick={reanalyze} className="btn-primary">
        ⚡ Neu analysieren (KI)
      </button>
      <button onClick={exportExcel} className="btn-secondary">
        📊 Excel Export
      </button>
    </div>
  );
}
