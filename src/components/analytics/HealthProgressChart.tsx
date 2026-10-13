import React from "react";
import { CheckCircle2, Circle, AlertCircle, Target, Sparkles } from "lucide-react";

interface TargetProgressItem {
  label: string;
  current: number | null;
  target: number;
  unit: string;
  category: "sleep" | "water" | "activity" | "consistency";
}

interface HealthProgressChartProps {
  items: TargetProgressItem[];
  consistencyRate: number;
  daysTracked: number;
  totalDays: number;
}

export const HealthProgressChart: React.FC<HealthProgressChartProps> = ({
  items,
  consistencyRate,
  daysTracked,
  totalDays,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#14B8A6]">
            <Target className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">
              Target Completion Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated against your profile goals over this period
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-black font-mono text-[#14B8A6]">
            {consistencyRate}%
          </span>
          <span className="block text-[10px] text-slate-400">
            {daysTracked} of {totalDays} days active
          </span>
        </div>
      </div>

      {/* Progress Bars for configured goals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {items.map((item) => {
          const hasRecord = item.current !== null && item.current !== undefined;
          const pct = hasRecord ? Math.min(100, Math.round((item.current! / item.target) * 100)) : 0;
          const met = pct >= 100;

          return (
            <div
              key={item.label}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#14233A] border border-slate-100 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                {hasRecord ? (
                  <span
                    className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                      met
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-teal-50 dark:bg-teal-950/40 text-[#14B8A6]"
                    }`}
                  >
                    {pct}% of goal
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">No logs</span>
                )}
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    met ? "bg-emerald-500" : "bg-[#14B8A6]"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>
                  {hasRecord ? `${item.current?.toLocaleString()} ${item.unit}` : "—"}
                </span>
                <span>
                  Target: {item.target.toLocaleString()} {item.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
