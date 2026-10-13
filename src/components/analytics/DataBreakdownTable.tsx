import React, { useState } from "react";
import { Table, Calendar, Activity, Moon, Droplets, Utensils, FileText, CheckCircle2 } from "lucide-react";

export interface MetricAnalysisRow {
  key: string;
  category: string;
  unit: string;
  total: number | string | null;
  average: number | string | null;
  median: number | string | null;
  min: number | string | null;
  max: number | string | null;
  recordedDays: number;
  missingDays: number;
  coveragePercent: number;
  previousValue: number | string | null;
  percentChange: number | null;
  latestRecordDate: string | null;
}

interface DataBreakdownTableProps {
  metrics: MetricAnalysisRow[];
}

export const DataBreakdownTable: React.FC<DataBreakdownTableProps> = ({ metrics }) => {
  const [selectedKey, setSelectedKey] = useState<string>("all");

  const filteredMetrics = selectedKey === "all" ? metrics : metrics.filter((m) => m.key === selectedKey);

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case "sleep":
        return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
      case "water":
        return <Droplets className="w-3.5 h-3.5 text-[#14B8A6]" />;
      case "activity":
        return <Activity className="w-3.5 h-3.5 text-emerald-500" />;
      case "nutrition":
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-[#14B8A6]" />
            Detailed Data Analysis & Mathematical Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Statistical parameters derived exclusively from user-logged records. Missing observations are accounted for without zero-substitution.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F4F7FB] dark:bg-[#132238] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#1E324F] text-xs">
          <button
            onClick={() => setSelectedKey("all")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              selectedKey === "all"
                ? "bg-[#14B8A6] text-[#0A1628] shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Metrics
          </button>
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedKey(m.key)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedKey === m.key
                  ? "bg-[#14B8A6] text-[#0A1628] shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {m.category}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto border border-[#E2E8F0] dark:border-[#1B2D48] rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] dark:bg-[#14233A] text-slate-500 dark:text-slate-400 font-bold border-b border-[#E2E8F0] dark:border-[#1B2D48]">
            <tr>
              <th className="py-3 px-4">Metric Domain</th>
              <th className="py-3 px-3">Total / Sum</th>
              <th className="py-3 px-3">Average</th>
              <th className="py-3 px-3">Median</th>
              <th className="py-3 px-3">Min / Max</th>
              <th className="py-3 px-3">Recorded vs Missing</th>
              <th className="py-3 px-3">Data Coverage</th>
              <th className="py-3 px-3">Prior Period</th>
              <th className="py-3 px-3">% Change</th>
              <th className="py-3 px-4 text-right">Latest Entry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1B2D48] text-slate-700 dark:text-slate-300 font-mono">
            {filteredMetrics.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-[#172944]/50 transition-colors">
                <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800">
                    {getCategoryIcon(row.key)}
                  </span>
                  <span>{row.category}</span>
                </td>

                <td className="py-3.5 px-3">
                  {row.total !== null ? `${row.total.toLocaleString()} ${row.unit}` : "—"}
                </td>

                <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                  {row.average !== null ? `${row.average.toLocaleString()} ${row.unit}` : "—"}
                </td>

                <td className="py-3.5 px-3">
                  {row.median !== null ? `${row.median.toLocaleString()} ${row.unit}` : "—"}
                </td>

                <td className="py-3.5 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                  {row.min !== null && row.max !== null
                    ? `${row.min} / ${row.max} ${row.unit}`
                    : "—"}
                </td>

                <td className="py-3.5 px-3">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{row.recordedDays}d</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-slate-400">{row.missingDays}d</span>
                </td>

                <td className="py-3.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.coveragePercent >= 70
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : row.coveragePercent >= 40
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {row.coveragePercent}%
                  </span>
                </td>

                <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                  {row.previousValue !== null ? `${row.previousValue} ${row.unit}` : "—"}
                </td>

                <td className="py-3.5 px-3 font-bold">
                  {row.percentChange !== null ? (
                    <span
                      className={
                        row.percentChange > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : row.percentChange < 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-400"
                      }
                    >
                      {row.percentChange > 0 ? `+${row.percentChange}%` : `${row.percentChange}%`}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">—</span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                  {row.latestRecordDate || "None"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
