import React, { useState } from "react";
import { Calendar, RefreshCw, ChevronDown, Check } from "lucide-react";

export type DateRangePreset = "today" | "7d" | "30d" | "90d" | "this_month" | "prev_month" | "custom";

interface DateRangeFilterProps {
  range: DateRangePreset;
  startDate?: string;
  endDate?: string;
  onRangeChange: (preset: DateRangePreset, customStart?: string, customEnd?: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  range,
  startDate,
  endDate,
  onRangeChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(startDate || new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]);
  const [customEnd, setCustomEnd] = useState(endDate || new Date().toISOString().split("T")[0]);

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "90d", label: "90 Days" },
    { id: "this_month", label: "This Month" },
    { id: "prev_month", label: "Prev Month" },
  ];

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onRangeChange("custom", customStart, customEnd);
      setShowCustomModal(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center bg-[#F4F7FB] dark:bg-[#132238] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#1E324F] text-xs font-semibold">
        {presets.map((p) => {
          const isActive = range === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onRangeChange(p.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isActive
                  ? "bg-[#14B8A6] text-[#0A1628] font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {p.label}
            </button>
          );
        })}

        {/* Custom Range Button */}
        <button
          onClick={() => setShowCustomModal(true)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
            range === "custom"
              ? "bg-[#14B8A6] text-[#0A1628] font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{range === "custom" && startDate && endDate ? `${startDate.slice(5)} - ${endDate.slice(5)}` : "Custom"}</span>
        </button>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-2 rounded-xl bg-white dark:bg-[#132238] border border-[#E2E8F0] dark:border-[#1E324F] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-[#CBD5E1] transition-all shadow-2xs disabled:opacity-50"
        title="Refresh Analytics Data"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#14B8A6]" : ""}`} />
      </button>

      {/* Custom Date Range Popover / Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#101C31] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1B2D48] shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#14B8A6]" />
                Select Custom Date Range
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E324F] bg-[#F8FAFC] dark:bg-[#172944] text-slate-800 dark:text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E324F] bg-[#F8FAFC] dark:bg-[#172944] text-slate-800 dark:text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1B2D48]">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustom}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#14B8A6] text-[#0A1628] hover:bg-[#0D9488] transition-colors"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
