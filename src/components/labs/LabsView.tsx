import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Edit3,
  PlusCircle,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { ExtractedLabResult, ViewTab } from "../../types/health.js";

interface LabsViewProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export const LabsView: React.FC<LabsViewProps> = ({ onNavigateTab }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [labs, setLabs] = useState<ExtractedLabResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTestForTrend, setSelectedTestForTrend] = useState<string>("");
  const [editingLab, setEditingLab] = useState<ExtractedLabResult | null>(null);
  const [correctionValue, setCorrectionValue] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Lab Manual Form
  const [newTestName, setNewTestName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newRefRange, setNewRefRange] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newCategory, setNewCategory] = useState<any>("Metabolic / Glucose");

  const fetchLabs = async () => {
    try {
      const res = await fetch("/api/labs");
      if (res.ok) {
        const data = await res.json();
        setLabs(data.labs || []);
        if (data.labs && data.labs.length > 0 && !selectedTestForTrend) {
          setSelectedTestForTrend(data.labs[0].testName);
        }
      }
    } catch (e) {
      console.error("Failed to load labs:", e);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, [user]);

  const categories = [
    "All",
    "Metabolic / Glucose",
    "Lipid Panel",
    "Hematology",
    "Renal / Kidney",
    "Thyroid",
    "Vitamins",
    "Other",
  ];

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || lab.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Trend data for selected test
  const trendHistory = labs
    .filter((l) => l.testName === selectedTestForTrend && typeof l.valueNumeric === "number")
    .sort((a, b) => a.observedDate.localeCompare(b.observedDate));

  const trendChartData = trendHistory.map((t) => ({
    date: t.observedDate,
    value: t.valueNumeric,
    unit: t.unit,
    refLow: t.referenceLow,
    refHigh: t.referenceHigh,
  }));

  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLab) return;

    const numVal = parseFloat(correctionValue);
    await fetch(`/api/labs/${editingLab.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valueText: correctionValue,
        valueNumeric: isNaN(numVal) ? editingLab.valueNumeric : numVal,
        userCorrection: {
          correctedValue: correctionValue,
          correctedBy: user?.name || "Patient",
          correctedAt: new Date().toISOString(),
          correctionReason: correctionReason || "User verified from physical report",
        },
      }),
    });

    setEditingLab(null);
    setCorrectionValue("");
    setCorrectionReason("");
    fetchLabs();
  };

  const handleAddManualLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim()) return;

    const numVal = parseFloat(newValue);
    await fetch("/api/labs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: "manual-entry",
        testName: newTestName,
        category: newCategory,
        valueNumeric: isNaN(numVal) ? undefined : numVal,
        valueText: newValue,
        unit: newUnit,
        referenceRangeText: newRefRange || "User specified range",
        sourceInterpretation: "Within Normal Range",
        observedDate: newDate,
        clinicalExplanationEn: `Manually recorded measurement for ${newTestName}.`,
        clinicalExplanationHi: `${newTestName} के लिए दर्ज किया गया परीक्षण।`,
        confidenceScore: 1.0,
      }),
    });

    setAddModalOpen(false);
    setNewTestName("");
    setNewValue("");
    fetchLabs();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#16B8A6]">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{t("navLabs")}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#142238] dark:text-white mt-0.5 tracking-tight">
            {t("labsExplorerTitle")}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Grouped diagnostic parameters evaluated strictly against each document's printed reference intervals
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Test Measurement</span>
        </button>
      </div>

      {/* Historical Longitudinal Chart (if >= 2 points for selected test) */}
      {trendHistory.length >= 2 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                Historical Progression
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedTestForTrend} ({trendHistory.length} measurements over time)
              </h2>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Latest: {trendHistory[trendHistory.length - 1].valueText} {trendHistory[trendHistory.length - 1].unit} on {trendHistory[trendHistory.length - 1].observedDate}
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={["auto", "auto"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#18B6A4"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#18B6A4", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchLabs")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Category Filter Pills (Functional Buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-teal-500 text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              {cat === "All" ? t("allCategories") : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Laboratory Results Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Test Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Measured Result</th>
                <th className="py-3.5 px-4">Source Reference Range</th>
                <th className="py-3.5 px-4">Interpretation</th>
                <th className="py-3.5 px-4">Observed Date</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLabs.map((lab) => {
                const isOutOfRange = lab.sourceInterpretation !== "Within Normal Range";
                return (
                  <tr
                    key={lab.id}
                    onClick={() => setSelectedTestForTrend(lab.testName)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {lab.testName}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                        {language === "hi" && lab.clinicalExplanationHi ? lab.clinicalExplanationHi : lab.clinicalExplanationEn}
                      </div>
                      {lab.userCorrection && (
                        <div className="text-[10px] text-teal-600 font-medium mt-0.5">
                          Corrected from {lab.userCorrection.correctedValue} ({lab.userCorrection.correctionReason})
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {lab.category}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {lab.valueText} <span className="font-normal text-slate-400 text-[11px]">{lab.unit}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {lab.referenceRangeText || "Standard clinical range"}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOutOfRange ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>{lab.sourceInterpretation}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t("withinRange")}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {lab.observedDate}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLab(lab);
                          setCorrectionValue(lab.valueText);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        title={t("correctValue")}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredLabs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                    No matching laboratory measurements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Correct Lab Value Modal (with Audit Trail) */}
      {editingLab && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("correctValue")}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingLab.testName} (Originally: {editingLab.valueText} {editingLab.unit})
                </p>
              </div>
              <button
                onClick={() => setEditingLab(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Corrected Measured Value
                </label>
                <input
                  type="text"
                  required
                  value={correctionValue}
                  onChange={(e) => setCorrectionValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Correction Reason / Audit Note
                </label>
                <input
                  type="text"
                  placeholder="e.g., Decimal misread from handwritten note"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLab(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-sm transition-colors"
                >
                  Save Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Manual Lab Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Laboratory Test
                </h3>
                <p className="text-xs text-slate-500">Record a historical or external clinic test</p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualLab} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Test Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., HbA1c, Fasting Glucose"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 7.4"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., %, mg/dL"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Reference Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 4.0 - 5.6%"
                    value={newRefRange}
                    onChange={(e) => setNewRefRange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-sm transition-colors"
                >
                  Save Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
