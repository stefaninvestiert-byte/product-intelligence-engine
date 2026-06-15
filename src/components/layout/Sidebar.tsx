"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/products", label: "Produkte", icon: "📦" },
  { href: "/trends", label: "Trends", icon: "📈" },
  { href: "/competitors", label: "Konkurrenz", icon: "🎯" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
];

export default function Sidebar({ unreadAlerts = 0 }: { unreadAlerts?: number }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
            PI
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Product</div>
            <div className="text-blue-400 font-bold text-sm leading-tight">Intelligence</div>
          </div>
        </div>
        <div className="mt-2 text-slate-500 text-xs">Engine v1.0</div>
      </div>

      {/* Markets */}
      <div className="px-6 py-3 border-b border-slate-800">
        <div className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wider">Zielmärkte</div>
        <div className="flex gap-2">
          {["🇩🇪", "🇦🇹", "🇳🇱", "🇸🇪"].map((flag) => (
            <span key={flag} className="text-lg">{flag}</span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const badgeCount = item.label === "Alerts" ? unreadAlerts : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {badgeCount && badgeCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => fetch("/api/scrapers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <span>🔍</span>
          <span>Scan starten</span>
        </button>
        <a
          href="/api/export"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          onClick={(e) => {
            e.preventDefault();
            fetch("/api/export", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ format: "EXCEL" }),
            })
              .then((r) => r.blob())
              .then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `products-${Date.now()}.xlsx`;
                a.click();
              });
          }}
        >
          <span>📊</span>
          <span>Excel Export</span>
        </a>
      </div>
    </aside>
  );
}
