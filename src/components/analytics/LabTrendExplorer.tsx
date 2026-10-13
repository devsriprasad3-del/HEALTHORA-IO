import React, { useState } from "react";
import { FlaskConical, AlertCircle, FileText, Calendar, CheckCircle2, Info } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip.js";
import { ExtractedLabResult } from "../../types/health.js";

interface LabTrendExplorerProps {
  labTrends: Record<string, ExtractedLabResult[]>;
  onNavigateToLabs?: () => void;
}

export const LabTrendExplorer: React.FC<LabTrendExplorerProps> = ({
  labTrends,
  onNavigateToLabs,
}) => {
  const testNames = Object.keys(labTrends || {});
  const [selectedTest, setSelectedTest] = useState<string>(testNames[0] || "");

  // Update selected test if current selection is invalid
  const currentTest = labTrends[selectedTest] ? selectedTest : testNames[0] || "";
  const measurements = currentTest ? labTrends[currentTest] || [] : [];

  if (testNames.length === 0 || measurements.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <FlaskConical className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">
              Clinical Laboratory Results Trajectory
            </h3>
          </div>
          {onNavigateToLabs && (
            <button
              onClick={onNavigateToLabs}
              className="text-xs font-bold text-[#14B8A6] hover:underline"
            >
              Labs Explorer →
            </button>
          )}
        </div>

        <div className="py-12 text-center bg-slate-50 dark:bg-[#14233A] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 my-2">
          <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
            No quantitative laboratory results with numerical trends found in your medical records.
          </p>
          <span className="text-[11px] text-[#14B8A6] font-bold mt-1.5 inline-block">
            Upload blood or metabolic panels in Medical Records to generate laboratory trajectory trends.
          </span>
        </div>

        <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Grounded laboratory trajectory tracker. Individual tests are never conflated across incompatible units.</span>
        </p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = measurements.map((m) => ({
    date: m.observedDate,
    displayDate: m.observedDate,
    value: m.valueNumeric,
    unit: m.unit,
    referenceRangeText: m.referenceRangeText || "Not specified",
    sourceInterpretation: m.sourceInterpretation || "Unspecified",
    documentId: m.documentId,
  }));

  const unit = measurements[0]?.unit || "";
  const latestResult = measurements[measurements.length - 1];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#101C31] border border-[#E2E8F0] dark:border-[#1B2D48] shadow-xs flex flex-col justify-between">
      {/* Top Header & Test Selector Dropdown */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <FlaskConical className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">
                Laboratory Result Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Single-biomarker serial analysis preserving original laboratory reference ranges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={currentTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1B2D48] bg-slate-50 dark:bg-[#14233A] text-slate-800 dark:text-white text-xs font-bold focus:ring-1 focus:ring-[#14B8A6] outline-hidden cursor-pointer"
            >
              {testNames.map((name) => (
                <option key={name} value={name}>
                  {name} ({labTrends[name].length} observation{labTrends[name].length > 1 ? "s" : ""})
                </option>
              ))}
            </select>

            {onNavigateToLabs && (
              <button
                onClick={onNavigateToLabs}
                className="text-xs font-bold text-[#14B8A6] hover:underline shrink-0"
              >
                Explorer →
              </button>
            )}
          </div>
        </div>

        {/* Latest Observation Metric Banner */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#14233A] border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs my-2">
          <div>
            <span className="font-bold text-slate-800 dark:text-white block">
              {currentTest}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              Observed: {latestResult.observedDate} • Reference Interval: {latestResult.referenceRangeText || "Standard"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-base font-black font-mono text-[#0F172A] dark:text-white">
              {latestResult.valueText || latestResult.valueNumeric} {unit}
            </span>
            <span
              className={`block text-[10px] font-bold ${
                latestResult.sourceInterpretation === "Within Normal Range"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {latestResult.sourceInterpretation || "Documented Result"}
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory Line Chart */}
      <div className="h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#cbd5e1" />
            <YAxis unit={unit} domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#cbd5e1" />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#101C31] text-white p-3 rounded-xl border border-[#1B2D48] shadow-xl text-xs z-50">
                    <div className="font-bold text-slate-300 pb-1 mb-1 border-b border-[#1B2D48] flex items-center justify-between gap-3">
                      <span>Observed: {d.date}</span>
                      <span className="text-[10px] text-teal-400 font-mono">{d.sourceInterpretation}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4 font-mono">
                        <span className="text-slate-400">Value:</span>
                        <span className="font-bold text-white">{d.value} {d.unit}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-[11px]">
                        <span className="text-slate-400">Ref Range:</span>
                        <span className="text-slate-300">{d.referenceRangeText}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={currentTest}
              stroke="#8B5CF6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#8B5CF6", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grounded Clinical Disclaimer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-start gap-1">
        <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Preserves original hospital and diagnostic laboratory test values and units. A single measurement does not establish a diagnosis; always review laboratory trajectories with your physician.
        </span>
      </div>
    </div>
  );
};
