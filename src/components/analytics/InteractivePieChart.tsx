import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip.js";
import { Info } from "lucide-react";

export interface PieSegment {
  name: string;
  count?: number;
  value?: number;
  grams?: number;
  calories?: number;
  percent: number;
  color: string;
  emoji?: string;
}

interface InteractivePieChartProps {
  title: string;
  subtitle?: string;
  disclaimer?: string;
  segments: PieSegment[];
  unit?: string;
  centerTotalLabel?: string;
  centerTotalValue?: string | number;
  emptyStateMessage?: string;
  valueKey?: "count" | "value" | "calories" | "grams";
  icon?: React.ReactNode;
}

export const InteractivePieChart: React.FC<InteractivePieChartProps> = ({
  title,
  subtitle,
  disclaimer,
  segments,
  unit = "entries",
  centerTotalLabel = "Total",
  centerTotalValue,
  emptyStateMessage = "No data recorded for this category yet.",
  valueKey = "count",
  icon,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter segments that have positive values
  const validSegments = segments.filter((s) => {
    const val = (s as any)[valueKey] ?? s.count ?? s.value ?? 0;
    return val > 0;
  });

  const total = validSegments.reduce((sum, s) => {
    const val = (s as any)[valueKey] ?? s.count ?? s.value ?? 0;
    return sum + val;
  }, 0);

  const displayCenterTotal = centerTotalValue !== undefined ? centerTotalValue : total;

  if (validSegments.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {icon && <span className="text-[#14B8A6]">{icon}</span>}
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">{title}</h3>
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>

        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-3">
            0%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">{emptyStateMessage}</p>
        </div>

        {disclaimer && (
          <p className="text-[10px] text-slate-400 flex items-start gap-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
            <span>{disclaimer}</span>
          </p>
        )}
      </div>
    );
  }

  // Format data for Recharts Pie
  const chartData = validSegments.map((s) => ({
    name: s.name,
    value: (s as any)[valueKey] ?? s.count ?? s.value ?? 0,
    color: s.color,
    percent: s.percent,
    raw: s,
  }));

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs flex flex-col justify-between">
      {/* Chart Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-[#14B8A6]">{icon}</span>}
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">{title}</h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
            {total.toLocaleString()} {unit}
          </span>
        </div>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{subtitle}</p>}
      </div>

      {/* Donut Chart with Centered Total */}
      <div className="relative h-56 w-full flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#101C31] text-white p-2.5 rounded-xl border border-[#1B2D48] shadow-xl text-xs z-50">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
                        <span>{data.name}</span>
                      </div>
                      <div className="text-slate-300 font-mono text-[11px]">
                        {data.value.toLocaleString()} {unit} ({data.percent}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={activeIndex === index ? "#ffffff" : "transparent"}
                  strokeWidth={2}
                  className="transition-all duration-200 cursor-pointer"
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white font-mono tracking-tight">
            {typeof displayCenterTotal === "number" ? displayCenterTotal.toLocaleString() : displayCenterTotal}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {centerTotalLabel}
          </span>
        </div>
      </div>

      {/* Breakdown List / Legend with Percentages */}
      <div className="space-y-1.5 pt-3 border-t border-[#F1F5F9] dark:border-[#172944]">
        {validSegments.map((s, idx) => {
          const val = (s as any)[valueKey] ?? s.count ?? s.value ?? 0;
          const isHovered = activeIndex === idx;

          return (
            <div
              key={s.name}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                isHovered ? "bg-slate-50 dark:bg-[#172944]" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {s.emoji ? `${s.emoji} ` : ""}
                  {s.name}
                </span>
              </div>

              <div className="flex items-center gap-2.5 font-mono">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {val.toLocaleString()} {unit}
                </span>
                <span className="font-bold text-slate-900 dark:text-white w-9 text-right text-[11px]">
                  {s.percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informative Grounded Disclaimer */}
      {disclaimer && (
        <div className="mt-3 pt-2 text-[10px] text-slate-400 flex items-start gap-1">
          <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
          <span>{disclaimer}</span>
        </div>
      )}
    </div>
  );
};
