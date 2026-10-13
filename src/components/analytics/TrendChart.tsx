import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip.js";
import { Info } from "lucide-react";

export interface TimeSeriesPoint {
  date: string;
  displayDate: string;
  [key: string]: any;
}

interface TrendSeries {
  dataKey: string;
  name: string;
  color: string;
  strokeWidth?: number;
  unit?: string;
  dot?: boolean;
}

interface TrendChartProps {
  title: string;
  subtitle?: string;
  data: TimeSeriesPoint[];
  series: TrendSeries[];
  referenceLines?: Array<{
    y: number;
    label: string;
    color?: string;
    strokeDasharray?: string;
  }>;
  yAxisUnit?: string;
  yAxisDomain?: [number | "auto", number | "auto"];
  emptyStateMessage?: string;
  footerNote?: string;
  icon?: React.ReactNode;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  title,
  subtitle,
  data,
  series,
  referenceLines = [],
  yAxisUnit = "",
  yAxisDomain = ["auto", "auto"],
  emptyStateMessage = "No time-series data recorded for this period.",
  footerNote,
  icon,
}) => {
  // Check if at least one series has a non-null observation
  const hasObservations = series.some((s) =>
    data.some((d) => d[s.dataKey] !== null && d[s.dataKey] !== undefined)
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

      {/* Chart Canvas or Grounded Empty State */}
      <div className="h-64 w-full my-2">
        {hasObservations ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                stroke="#cbd5e1"
              />
              <YAxis
                unit={yAxisUnit}
                domain={yAxisDomain}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                stroke="#cbd5e1"
              />
              <Tooltip
                content={(props: any) => (
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload}
                    label={props.label}
                    unit={yAxisUnit}
                    titlePrefix="Date"
                  />
                )}
              />

              {/* Configured Reference Threshold Lines (e.g. 8h sleep or 2,500ml water) */}
              {referenceLines.map((ref, idx) => (
                <ReferenceLine
                  key={idx}
                  y={ref.y}
                  stroke={ref.color || "#14B8A6"}
                  strokeDasharray={ref.strokeDasharray || "4 4"}
                  label={{
                    value: ref.label,
                    fill: ref.color || "#14B8A6",
                    fontSize: 10,
                    position: "right",
                  }}
                />
              ))}

              {/* Series Lines with connectNulls={false} to preserve missing observations */}
              {series.map((s) => (
                <Line
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth || 2.5}
                  dot={
                    s.dot !== false
                      ? { r: 3.5, fill: s.color, strokeWidth: 1.5, stroke: "#ffffff" }
                      : false
                  }
                  activeDot={{ r: 5.5, stroke: "#ffffff", strokeWidth: 2 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-[#14233A] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {emptyStateMessage}
            </span>
            <span className="text-[11px] text-[#14B8A6] font-bold mt-1">
              Add tracking entries in the Daily Tracking tab to generate trends.
            </span>
          </div>
        )}
      </div>

      {/* Footer Notes & Legend Indicator */}
      <div className="pt-3 border-t border-[#F1F5F9] dark:border-[#172944] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-3">
          {series.map((s) => (
            <div key={s.dataKey} className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: s.color }} />
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
