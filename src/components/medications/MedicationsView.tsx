import React, { useState, useEffect } from "react";
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Edit3,
  Archive,
  Calendar,
  Bell,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { MedicationItem, ViewTab } from "../../types/health.js";

interface MedicationsViewProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({ onNavigateTab }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "extracted" | "history">("active");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Medication Form
  const [newName, setNewName] = useState("");
  const [newStrength, setNewStrength] = useState("");
  const [newDosage, setNewDosage] = useState("1 tablet");
  const [newFrequency, setNewFrequency] = useState("Once daily (OD)");
  const [newInstructions, setNewInstructions] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00");

  const fetchMedications = async () => {
    try {
      const res = await fetch("/api/medications");
      if (res.ok) {
        const data = await res.json();
        setMedications(data.medications || []);
      }
    } catch (e) {
      console.error("Failed to load medications:", e);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [user]);

  const activeMeds = medications.filter((m) => m.status === "Active");
  const extractedMeds = medications.filter((m) => m.status === "Extracted");
  const historyMeds = medications.filter((m) => m.status === "Completed" || m.status === "Discontinued");

  const handleConfirmExtracted = async (med: MedicationItem) => {
    await fetch(`/api/medications/${med.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Active",
        userConfirmed: true,
        reminders: [
          {
            id: `rem-${Date.now()}`,
            time: "08:30",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            enabled: true,
          },
        ],
      }),
    });
    fetchMedications();
  };

  const handleDiscontinue = async (med: MedicationItem) => {
    if (confirm(`Archive ${med.name} into medication history?`)) {
      await fetch(`/api/medications/${med.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Discontinued",
          endDate: new Date().toISOString().split("T")[0],
        }),
      });
      fetchMedications();
    }
  };

  const handleReminderAction = async (medId: string, reminderId: string, action: "taken" | "skipped") => {
    await fetch(`/api/medications/${medId}/reminder-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderId, action }),
    });
    fetchMedications();
  };

  const handleAddMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        strength: newStrength || "Standard",
        dosage: newDosage,
        route: "Oral",
        frequency: newFrequency,
        instructions: newInstructions || "Take as instructed by your clinician",
        startDate: new Date().toISOString().split("T")[0],
        status: "Active",
        userConfirmed: true,
        prescribingDoctor: newDoctor || "Physician",
        reminders: [
          {
            id: `rem-${Date.now()}`,
            time: reminderTime,
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            enabled: true,
          },
        ],
      }),
    });

    setAddModalOpen(false);
    setNewName("");
    setNewStrength("");
    setNewInstructions("");
    fetchMedications();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#16B8A6]">
            <Pill className="w-3.5 h-3.5" />
            <span>{t("navMedications")}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#142238] dark:text-white mt-0.5 tracking-tight">
            {t("medsTitle")}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Organize active prescriptions, review extractions from doctor notes, and track daily doses
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Custom Medication</span>
        </button>
      </div>

      {/* Tabs Segmented Control */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-850 max-w-md">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "active"
              ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          {t("activeMedicationsTab")} ({activeMeds.length})
        </button>
        <button
          onClick={() => setActiveTab("extracted")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "extracted"
              ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          {t("extractedMedicationsTab")} ({extractedMeds.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === "history"
              ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          {t("historyMedicationsTab")} ({historyMeds.length})
        </button>
      </div>

      {/* Tab 1: Active Confirmed Medications */}
      {activeTab === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeMeds.map((med) => {
            const reminder = med.reminders?.[0];
            const isTaken = reminder?.lastAction?.action === "taken";
            return (
              <div
                key={med.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                      {med.route}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      User Confirmed
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {med.name}
                    </h3>
                    <div className="text-xs font-mono font-medium text-slate-500 mt-0.5">
                      {med.strength} · {med.dosage}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {med.frequency}
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      {language === "hi" && med.instructionsHi ? med.instructionsHi : med.instructions}
                    </div>
                  </div>

                  {reminder && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        Daily at {reminder.time}
                      </span>
                      {isTaken ? (
                        <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken Today
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold text-[11px]">
                          Pending Dose
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {reminder && !isTaken ? (
                    <button
                      onClick={() => handleReminderAction(med.id, reminder.id, "taken")}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors shadow-xs"
                    >
                      {t("markTaken")}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Started: {med.startDate}
                    </span>
                  )}

                  <button
                    onClick={() => handleDiscontinue(med)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Discontinue / Move to past history"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {activeMeds.length === 0 && (
            <div className="col-span-full py-14 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Pill className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">{t("noActiveMeds")}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Extracted from Reports (Awaiting user confirmation) */}
      {activeTab === "extracted" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
            <strong>Clinical Safety Rule:</strong> Healthora does not automatically treat medications extracted from uploaded documents as active prescriptions until you confirm you are actively taking them.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {extractedMeds.map((med) => (
              <div
                key={med.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    Awaiting Patient Confirmation
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{med.startDate}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {med.name}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {med.strength} · {med.dosage}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {med.frequency}
                  </div>
                  <div className="text-[11px] mt-0.5">{med.instructions}</div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => handleConfirmExtracted(med)}
                    className="w-full py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t("confirmActive")}</span>
                  </button>
                </div>
              </div>
            ))}

            {extractedMeds.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">
                No unconfirmed extracted medications awaiting review.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Historical Medications */}
      {activeTab === "history" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {historyMeds.map((med) => (
            <div
              key={med.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {med.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {med.startDate} → {med.endDate || "Concluded"}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-through">
                  {med.name}
                </h3>
                <div className="text-xs text-slate-500">{med.strength}</div>
              </div>

              <div className="text-[11px] text-slate-500">
                Prescribed by: {med.prescribingDoctor || "Physician"}
              </div>
            </div>
          ))}

          {historyMeds.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No historical or concluded medications recorded.
            </div>
          )}
        </div>
      )}

      {/* Add Custom Medication Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Active Medication
                </h3>
                <p className="text-xs text-slate-500">Record a prescription and set dose reminders</p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Metformin 500mg"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Strength
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 500 mg, 10 mg"
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1 tablet"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Frequency
                </label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Once daily in the morning (OD)">Once daily in the morning (OD)</option>
                  <option value="Twice daily with meals (BD)">Twice daily with meals (BD)</option>
                  <option value="Three times daily (TDS)">Three times daily (TDS)</option>
                  <option value="Once daily at bedtime (HS)">Once daily at bedtime (HS)</option>
                  <option value="Once weekly">Once weekly</option>
                  <option value="As needed (SOS)">As needed (SOS)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Daily Reminder Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Prescribing Doctor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. K. Srinivas"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Administration Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g., Take with or immediately after food"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
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
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
