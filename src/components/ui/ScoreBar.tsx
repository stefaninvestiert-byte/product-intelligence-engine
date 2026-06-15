"use client";

type ScoreBarProps = {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
};

function getScoreColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-green-500";
  if (score >= 55) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function getScoreTextColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-green-400";
  if (score >= 55) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

export default function ScoreBar({
  score,
  label,
  size = "md",
  showValue = true,
  className = "",
}: ScoreBarProps) {
  const heights = { sm: "h-1", md: "h-2", lg: "h-3" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className={`${textSizes[size]} text-slate-400`}>{label}</span>
          )}
          {showValue && (
            <span className={`${textSizes[size]} font-bold ${getScoreTextColor(score)}`}>
              {Math.round(score)}
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-slate-700 rounded-full overflow-hidden`}>
        <div
          className={`${heights[size]} ${getScoreColor(score)} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const { bg, text } = score >= 85
    ? { bg: "bg-emerald-900/50 border border-emerald-500/50", text: "text-emerald-400" }
    : score >= 70
    ? { bg: "bg-green-900/50 border border-green-500/50", text: "text-green-400" }
    : score >= 55
    ? { bg: "bg-yellow-900/50 border border-yellow-500/50", text: "text-yellow-400" }
    : score >= 40
    ? { bg: "bg-orange-900/50 border border-orange-500/50", text: "text-orange-400" }
    : { bg: "bg-red-900/50 border border-red-500/50", text: "text-red-400" };

  const label = score >= 85 ? "TOP" : score >= 70 ? "GUT" : score >= 55 ? "OK" : "SCHWACH";

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bg}`}>
      <span className={`text-lg font-black ${text}`}>{Math.round(score)}</span>
      <span className={`text-xs font-semibold ${text} opacity-80`}>{label}</span>
    </div>
  );
}
