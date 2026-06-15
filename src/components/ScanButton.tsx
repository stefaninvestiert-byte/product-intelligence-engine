"use client";

export default function ScanButton() {
  return (
    <button
      onClick={() =>
        fetch('/api/scrapers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      }
      className="btn-primary flex items-center gap-2"
    >
      <span>🔍</span> Jetzt scannen
    </button>
  );
}
