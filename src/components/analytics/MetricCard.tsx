import React from "react";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

export interface SparklinePoint {
  date: string;
  value: number | null;
}

export interface MetricCardProps {
  id: string;
  title: string;
  value: string | number | null;
  unit: string;
  dateRangeLabel?: string;
  previousValue?: string | number | null;
  percentChange?: number | null;
  trendDirection?: "up" | "down" | "flat" | null;
  isDesirableTrend?: "up" | "down" | "neutral"; // e.g. up is good for sleep, down could be good for cholesterol
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  sparklineData?: SparklinePoint[];
  sparklineColor?: string;
  emptyStateText?: string;
  recordPromptText?: string;
  onClickDetail?: () => void;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  unit,
  dateRangeLabel,
  previousValue,
  percentChange,
  trendDirection,
  isDesirableTrend = "up",
  icon,
  iconBgColor = "bg-teal-50 dark:bg-teal-950/40",
  iconColor = "text-[#14B8A6]",
  sparklineData,
  sparklineColor = "#14B8A6",
  emptyStateText = "No logs recorded for this period.",
  recordPromptText,
  onClickDetail,
  badge,
}) => {
  const hasValue = value !== null && value !== undefined && value !== "";
  const validSparkline = (sparklineData || []).filter((p) => p.value !== null && typeof p.value === "number");
  const hasSparkline = validSparkline.length >= 2;

  // Trend formatting & colors
  const getTrendBadge = () => {
    if (percentChange === null || percentChange === undefined || !trendDirection) return null;

    const isPositiveChange = percentChange > 0;
    const isGood =
      isDesirableTrend === "neutral"
        ? true
        : isDesirableTrend === "up"
        ? isPositiveChange
        : !isPositiveChange;

    const colorClasses = isGood
      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50"
      : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50";

    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border font-mono ${colorClasses}`}
        title={`Previous period: ${previousValue ?? "N/A"}`}
      >
        {trendDirection === "up" && <TrendingUp className="w-2.5 h-2.5" />}
        {trendDirection === "down" && <TrendingDown className="w-2.5 h-2.5" />}
        {trendDirection === "flat" && <Minus className="w-2.5 h-2.5" />}
        <span>{percentChange > 0 ? `+${percentChange}%` : `${percentChange}%`}</span>
      </span>
    );
  };

  return (
    <div
      onClick={onClickDetail}
      className={`group relative p-5 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
        onClickDetail ? "cursor-pointer hover:border-[#14B8A6]/40" : ""
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shadow-2xs`}>
              {icon}
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">
                {title}
              </h3>
              {dateRangeLabel && (
                <span className="text-[10px] text-slate-400 font-medium block">
                  {dateRangeLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {badge}
              </span>
            )}
            {getTrendBadge()}
          </div>
        </div>

        {/* Metric Value or Truthful Empty State */}
        {hasValue ? (
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-mono">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400">
              {unit}
            </span>
          </div>
        ) : (
          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#14233A] border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              {emptyStateText}
            </span>
            {recordPromptText && (
              <span className="text-[10px] text-[#14B8A6] font-bold mt-0.5 block">
                {recordPromptText}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sparkline & Footer Action */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] dark:border-[#172944] flex items-center justify-between gap-2">
        {hasSparkline ? (
          <div className="h-8 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={validSparkline}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={sparklineColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400">
            {previousValue !== null && previousValue !== undefined
              ? `Prior period: ${previousValue} ${unit}`
              : "No prior comparison"}
          </span>
        )}

        {onClickDetail && (
          <button
            type="button"
            className="flex items-center gap-1 text-[11px] font-bold text-[#14B8A6] group-hover:text-[#0D9488] transition-colors"
          >
            <span>Analyze</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
