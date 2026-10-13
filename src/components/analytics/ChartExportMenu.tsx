import React, { useState, useRef, useEffect } from "react";
import { Download, FileJson, FileSpreadsheet, Printer, ChevronDown } from "lucide-react";

interface ChartExportMenuProps {
  analyticsData: any;
  rangeLabel: string;
}

export const ChartExportMenu: React.FC<ChartExportMenuProps> = ({
  analyticsData,
  rangeLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportJSON = () => {
    if (!analyticsData) return;
    const jsonStr = JSON.stringify(analyticsData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `healthora-analytics-${rangeLabel}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    if (!analyticsData || !analyticsData.dateKeys) return;
    const dates: string[] = analyticsData.dateKeys;

    // Header row
    const headers = [
      "Date",
      "Sleep Duration (hrs)",
      "Water Intake (ml)",
      "Active Duration (mins)",
      "Calories (kcal)",
      "Protein (g)",
      "Carbs (g)",
      "Fat (g)",
    ];

    const sleepMap = new Map((analyticsData.sleepTrend || []).map((s: any) => [s.date, s.durationHours]));
    const waterMap = new Map((analyticsData.waterTrend || []).map((w: any) => [w.date, w.amountMl]));
    const actMap = new Map((analyticsData.activityTrend || []).map((a: any) => [a.date, a.activeMinutes]));
    const nutMap = new Map((analyticsData.nutritionTrend || []).map((n: any) => [n.date, n]));

    const rows = dates.map((d) => {
      const nut: any = nutMap.get(d) || {};
      return [
        d,
        sleepMap.get(d) ?? "",
        waterMap.get(d) ?? "",
        actMap.get(d) ?? "",
        nut.calories ?? "",
        nut.protein ?? "",
        nut.carbs ?? "",
        nut.fat ?? "",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `healthora-analytics-${rangeLabel}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handlePrintSummary = () => {
    window.print();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#132238] border border-[#E2E8F0] dark:border-[#1E324F] hover:bg-slate-50 dark:hover:bg-[#172944] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs"
      >
        <Download className="w-3.5 h-3.5 text-[#14B8A6]" />
        <span>Export</span>
        <ChevronDown className="w-3 h-3 ml-0.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xl z-50 py-1 text-xs animate-fade-in font-medium">
          <button
            onClick={handleExportCSV}
            className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172944]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV Spreadsheet</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172944]"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-500" />
            <span>Export Full JSON Data</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            onClick={handlePrintSummary}
            className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172944]"
          >
            <Printer className="w-3.5 h-3.5 text-purple-500" />
            <span>Print Clinical Summary</span>
          </button>
        </div>
      )}
    </div>
  );
};
