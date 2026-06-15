type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
};

const colorMap = {
  blue: {
    bg: "bg-blue-900/30",
    border: "border-blue-500/30",
    icon: "bg-blue-600/30 text-blue-400",
    value: "text-blue-300",
    trend: "text-blue-400",
  },
  green: {
    bg: "bg-green-900/30",
    border: "border-green-500/30",
    icon: "bg-green-600/30 text-green-400",
    value: "text-green-300",
    trend: "text-green-400",
  },
  purple: {
    bg: "bg-purple-900/30",
    border: "border-purple-500/30",
    icon: "bg-purple-600/30 text-purple-400",
    value: "text-purple-300",
    trend: "text-purple-400",
  },
  orange: {
    bg: "bg-orange-900/30",
    border: "border-orange-500/30",
    icon: "bg-orange-600/30 text-orange-400",
    value: "text-orange-300",
    trend: "text-orange-400",
  },
  red: {
    bg: "bg-red-900/30",
    border: "border-red-500/30",
    icon: "bg-red-600/30 text-red-400",
    value: "text-red-300",
    trend: "text-red-400",
  },
  cyan: {
    bg: "bg-cyan-900/30",
    border: "border-cyan-500/30",
    icon: "bg-cyan-600/30 text-cyan-400",
    value: "text-cyan-300",
    trend: "text-cyan-400",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-5 flex items-start gap-4`}>
      <div className={`${colors.icon} w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-slate-400 text-sm font-medium truncate">{title}</div>
        <div className={`${colors.value} text-3xl font-black mt-0.5`}>{value}</div>
        {subtitle && (
          <div className="text-slate-500 text-xs mt-1">{subtitle}</div>
        )}
        {trend && (
          <div className={`${colors.trend} text-xs font-semibold mt-1`}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
    </div>
  );
}
