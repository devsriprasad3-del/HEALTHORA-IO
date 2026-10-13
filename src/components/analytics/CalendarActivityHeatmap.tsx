import React from "react";
import { Calendar } from "lucide-react";

interface HeatmapDay {
  date: string;
  count: number;
  intensity: number; // 0 to 4
}

interface CalendarActivityHeatmapProps {
  data: HeatmapDay[];
  title?: string;
  subtitle?: string;
}

export const CalendarActivityHeatmap: React.FC<CalendarActivityHeatmapProps> = ({
  data,
  title = "Tracking Activity Matrix",
  subtitle = "Recorded logs per day across sleep, water, meals, activity, mood, and journal",
}) => {
  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 1:
        return "bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-900";
      case 2:
        return "bg-teal-300 dark:bg-teal-800/80 text-teal-950 dark:text-white border-teal-400 dark:border-teal-700";
      case 3:
        return "bg-[#14B8A6] text-white border-teal-500 font-bold";
      case 4:
        return "bg-[#0F766E] dark:bg-[#115E59] text-white border-[#134E4A] font-black";
      default:
        return "bg-slate-50 dark:bg-[#14233A] text-slate-400 border-slate-100 dark:border-slate-800";
    }
  };

  const totalLogs = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#14B8A6]">
            <Calendar className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            {totalLogs.toLocaleString()} total entries
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
        {data.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} entries recorded`}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono border transition-all hover:scale-110 cursor-pointer ${getIntensityClass(
              day.intensity
            )}`}
          >
            <span className="leading-none text-[9px] opacity-75">{day.date.slice(8)}</span>
            {day.count > 0 && <span className="text-[10px] leading-none mt-0.5">{day.count}</span>}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        <span>Daily logging volume</span>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span>0</span>
          <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 dark:bg-[#14233A] border border-slate-200 dark:border-slate-800" />
          <div className="w-3.5 h-3.5 rounded-xs bg-teal-100 dark:bg-teal-950/60 border border-teal-200" />
          <div className="w-3.5 h-3.5 rounded-xs bg-teal-300 dark:bg-teal-800/80 border border-teal-400" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#14B8A6] border border-teal-500" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#0F766E] border border-[#134E4A]" />
          <span>6+</span>
        </div>
      </div>
    </div>
  );
};
