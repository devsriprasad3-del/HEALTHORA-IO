import React, { useState, useEffect } from "react";
import {
  FileDown,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Pill,
  FlaskConical,
  ShieldAlert,
  User,
  Calendar,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { ViewTab } from "../../types/health.js";

interface ExportViewProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({ onNavigateTab }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [dossierData, setDossierData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDossier = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/reports/summary-export");
      if (res.ok) {
        const data = await res.json();
        setDossierData(data);
      }
    } catch (e) {
      console.error("Failed to load export dossier:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!dossierData) return;
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dossierData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `Healthora_Clinician_Dossier_${user?.name?.replace(/\s+/g, "_") || "Patient"}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#16B8A6]">
            <FileDown className="w-3.5 h-3.5" />
            <span>{t("navExport")}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#142238] dark:text-white mt-0.5 tracking-tight">
            {t("exportTitle")}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            {t("exportSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#F5F7FB] dark:bg-[#1B2D48] text-slate-700 dark:text-slate-200 border border-[#E4EAF1] dark:border-[#1B2D48] hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t("downloadJson")}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>{t("printDossier")}</span>
          </button>
        </div>
      </div>

      {/* The Printable Clinical Dossier Paper Surface */}
      {dossierData && (
        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-md space-y-8">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-200 dark:border-slate-800 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-teal-600">
                  HEALTHORA
                </span>
                <span className="text-xs text-slate-400 font-medium">| Patient Consultation Dossier</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Clinical Health & Pharmacotherapy Brief
              </h2>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-0.5 font-mono">
              <div>Date Generated: {new Date(dossierData.generatedAt).toLocaleDateString()}</div>
              <div>Provenance: Healthora AI Copilot Vault</div>
            </div>
          </div>

          {/* Patient Demographics & Profile Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs">
            <div>
              <div className="text-slate-400">Patient Name</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{dossierData.patient?.name}</div>
            </div>
            <div>
              <div className="text-slate-400">Date of Birth / Gender</div>
              <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {dossierData.patient?.dob || "1978-04-14"} ({dossierData.patient?.gender || "Male"})
              </div>
            </div>
            <div>
              <div className="text-slate-400">Blood Group</div>
              <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {dossierData.patient?.bloodGroup || "B+"}
              </div>
            </div>
            <div>
              <div className="text-slate-400">ABHA Health ID (Demo)</div>
              <div className="font-mono text-teal-600 font-semibold mt-0.5">
                {dossierData.patient?.abhaNumber || "91-4821-9032-4112"}
              </div>
            </div>
          </div>

          {/* Known Conditions & Allergies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white block">
                Documented Chronic Conditions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(dossierData.keyClinicalHighlights?.chronicConditions || []).map((cond: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 text-[11px] font-medium">
                    {cond}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white block">
                Documented Allergies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(dossierData.keyClinicalHighlights?.knownAllergies || []).map((all: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-[11px] font-medium">
                    {all}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 1: Active Prescriptions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>Current Active Pharmacotherapy</span>
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-850 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Medication Name & Strength</th>
                    <th className="py-2.5 px-3">Dosage & Frequency</th>
                    <th className="py-2.5 px-3">Administration Instructions</th>
                    <th className="py-2.5 px-3">Prescriber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(dossierData.keyClinicalHighlights?.activeMedications || []).map((m: any) => (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {m.name} ({m.strength})
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {m.dosage} · {m.frequency}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {m.instructions}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {m.prescribingDoctor || "Physician"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Out of Range Observations */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              <span>Reported Out-of-Range Observations</span>
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-850 font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Test Parameter</th>
                    <th className="py-2.5 px-3 text-right">Measured Value</th>
                    <th className="py-2.5 px-3">Source Printed Reference Range</th>
                    <th className="py-2.5 px-3">Report Interpretation</th>
                    <th className="py-2.5 px-3">Observed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(dossierData.keyClinicalHighlights?.abnormalLabObservations || []).map((lab: any) => (
                    <tr key={lab.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {lab.testName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                        {lab.valueText} {lab.unit}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {lab.referenceRangeText}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-amber-600">
                        {lab.sourceInterpretation}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {lab.observedDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Suggested Clinician Discussion Topics */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Prepared Discussion Topics for Consultation
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {(dossierData.suggestedDiscussionTopics || []).map((topic: string, i: number) => (
                <li key={i}>{topic}</li>
              ))}
            </ul>
          </div>

          {/* Footer & Audit Certification */}
          <div className="pt-6 border-t-2 border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 gap-4">
            <div className="flex items-center gap-1.5 font-medium text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t("verifiedAuditStamp")}</span>
            </div>
            <div className="text-right italic">
              Strictly confidential medical summary for doctor-patient consultation.
            </div>
          </div>

          {/* Mandatory Safety Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            {dossierData.safetyNotice}
          </div>
        </div>
      )}
    </div>
  );
};
