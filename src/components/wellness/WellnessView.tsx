import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  PlusCircle,
  Download,
  Moon,
  Footprints,
  Droplet,
  Activity,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { WellnessEntry, ViewTab } from "../../types/health.js";

interface WellnessViewProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export const WellnessView: React.FC<WellnessViewProps> = ({ onNavigateTab }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [wellnessLogs, setWellnessLogs] = useState<WellnessEntry[]>([]);
  const [logModalOpen, setLogModalOpen] = useState(false);

  // Form state
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [steps, setSteps] = useState(8000);
  const [waterGlasses, setWaterGlasses] = useState(8);
  const [restingHr, setRestingHr] = useState(70);
  const [bpSystolic, setBpSystolic] = useState(122);
  const [bpDiastolic, setBpDiastolic] = useState(80);
  const [notes, setNotes] = useState("");

  const fetchWellness = async () => {
    try {
      const res = await fetch("/api/wellness");
      if (res.ok) {
        const data = await res.json();
        setWellnessLogs(data.wellness || []);
      }
    } catch (e) {
      console.error("Failed to load wellness:", e);
    }
  };

  useEffect(() => {
    fetchWellness();
  }, [user]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("/api/wellness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: logDate,
        sleepHours: Number(sleepHours),
        steps: Number(steps),
        waterGlasses: Number(waterGlasses),
        restingHeartRate: Number(restingHr),
        bloodPressureSystolic: Number(bpSystolic),
        bloodPressureDiastolic: Number(bpDiastolic),
        notes,
      }),
    });

    setLogModalOpen(false);
    fetchWellness();
  };

  const handleExportCsv = () => {
    if (wellnessLogs.length === 0) return;

    const headers = ["Date", "Sleep_Hours", "Steps", "Water_Glasses", "Resting_HR_BPM", "BP_Systolic", "BP_Diastolic", "Notes"];
    const rows = wellnessLogs.map((w) => [
      w.date,
      w.sleepHours,
      w.steps,
      w.waterGlasses,
      w.restingHeartRate || "",
      w.bloodPressureSystolic || "",
      w.bloodPressureDiastolic || "",
      `"${(w.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Healthora_Wellness_Log_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recent averages
  const recent7 = wellnessLogs.slice(-7);
  const avgSleep = recent7.length ? (recent7.reduce((a, b) => a + b.sleepHours, 0) / recent7.length).toFixed(1) : "0";
  const avgSteps = recent7.length ? Math.round(recent7.reduce((a, b) => a + b.steps, 0) / recent7.length) : 0;
  const avgWater = recent7.length ? (recent7.reduce((a, b) => a + b.waterGlasses, 0) / recent7.length).toFixed(1) : "0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#16B8A6]">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{t("navWellness")}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#142238] dark:text-white mt-0.5 tracking-tight">
            {t("wellnessTitle")}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Track daily sleep, hydration, activity, and resting vitals alongside your clinical reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={wellnessLogs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#F5F7FB] dark:bg-[#1B2D48] text-slate-700 dark:text-slate-200 border border-[#E4EAF1] dark:border-[#1B2D48] hover:bg-slate-200 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t("exportCsv")}</span>
          </button>
          <button
            onClick={() => setLogModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t("logToday")}</span>
          </button>
        </div>
      </div>

      {/* 3 Key Metric Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t("sleepHours")} 7D Avg</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {avgSleep} <span className="text-xs font-normal text-slate-400">hours / night</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
            <Footprints className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t("stepCount")} 7D Avg</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {avgSteps.toLocaleString()} <span className="text-xs font-normal text-slate-400">steps / day</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t("hydration")} 7D Avg</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {avgWater} <span className="text-xs font-normal text-slate-400">glasses / day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts: Sleep Progression & Daily Physical Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Duration Line Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Sleep Duration History
            </h2>
            <p className="text-xs text-slate-500">Nightly sleep duration over logged dates</p>
          </div>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wellnessLogs} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[4, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sleepHours"
                  stroke="#18B6A4"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#18B6A4" }}
                  name="Sleep (hrs)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Physical Activity Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Physical Activity
            </h2>
            <p className="text-xs text-slate-500">Step count recorded by date</p>
          </div>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wellnessLogs} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="steps" fill="#69E1D0" radius={[6, 6, 0, 0]} name="Steps" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("logToday")}
                </h3>
                <p className="text-xs text-slate-500">Maintain daily lifestyle context</p>
              </div>
              <button
                onClick={() => setLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Log Date
                </label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Sleep Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Physical Activity (Steps)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Water Intake (Glasses)
                  </label>
                  <input
                    type="number"
                    value={waterGlasses}
                    onChange={(e) => setWaterGlasses(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Resting Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={restingHr}
                    onChange={(e) => setRestingHr(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Blood Pressure Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    BP Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Personal Notes / Energy Level
                </label>
                <input
                  type="text"
                  placeholder="e.g., Slept deeply; morning brisk walk"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-sm transition-colors"
                >
                  Save Daily Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
