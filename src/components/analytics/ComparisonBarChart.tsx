import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip.js";
import { Info } from "lucide-react";

export interface BarSeriesConfig {
  dataKey: string;
  name: string;
  color: string;
  stackId?: string;
  radius?: [number, number, number, number];
}

interface ComparisonBarChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  series: BarSeriesConfig[];
  xAxisKey?: string;
  yAxisUnit?: string;
  yAxisDomain?: [number | "auto", number | "auto"];
  referenceLineY?: number;
  referenceLineLabel?: string;
  emptyStateMessage?: string;
  footerNote?: string;
  layout?: "horizontal" | "vertical";
  icon?: React.ReactNode;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  title,
  subtitle,
  data,
  series,
  xAxisKey = "displayDate",
  yAxisUnit = "",
  yAxisDomain = ["auto", "auto"],
  referenceLineY,
  referenceLineLabel,
  emptyStateMessage = "No comparison data recorded for this period.",
  footerNote,
  layout = "horizontal",
  icon,
}) => {
  const isVertical = layout === "vertical";

  // Check if at least one series has observations
  const hasData = series.some((s) =>
    data.some((d) => d[s.dataKey] !== null && d[s.dataKey] !== undefined && d[s.dataKey] > 0)
  );

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-[#14B8A6]">{icon}</span>}
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">{title}</h3>
          </div>
          {yAxisUnit && (
            <span className="text-[11px] font-mono font-bold text-slate-400">
              Unit: {yAxisUnit}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{subtitle}</p>}
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full my-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout={isVertical ? "vertical" : "horizontal"}
              margin={{ top: 10, right: 10, left: isVertical ? 20 : -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />

              {isVertical ? (
                <>
                  <XAxis type="number" unit={yAxisUnit} tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#cbd5e1" />
                  <YAxis type="category" dataKey={xAxisKey} tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#cbd5e1" width={110} />
                </>
              ) : (
                <>
                  <XAxis dataKey={xAxisKey} tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#cbd5e1" />
                  <YAxis unit={yAxisUnit} domain={yAxisDomain} tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#cbd5e1" />
                </>
              )}

              <Tooltip
                content={(props: any) => (
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload}
                    label={props.label}
                    unit={yAxisUnit}
                    titlePrefix={isVertical ? "Category" : "Date"}
                  />
                )}
              />

              {referenceLineY !== undefined && (
                <ReferenceLine
                  y={isVertical ? undefined : referenceLineY}
                  x={isVertical ? referenceLineY : undefined}
                  stroke="#14B8A6"
                  strokeDasharray="4 4"
                  label={{
                    value: referenceLineLabel || `Target (${referenceLineY}${yAxisUnit})`,
                    fill: "#14B8A6",
                    fontSize: 10,
                  }}
                />
              )}

              {series.map((s) => (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.color}
                  stackId={s.stackId}
                  radius={s.radius || (isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0])}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-[#14233A] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {emptyStateMessage}
            </span>
          </div>
        )}
      </div>

      {/* Footer Notes & Legend Indicator */}
      <div className="pt-3 border-t border-[#F1F5F9] dark:border-[#172944] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-3">
          {series.map((s) => (
            <div key={s.dataKey} className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: s.color }} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>

        {footerNote && (
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            <span>{footerNote}</span>
          </div>
        )}
      </div>
    </div>
  );
};
