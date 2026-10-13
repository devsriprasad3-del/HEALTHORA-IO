import React, { useState, useEffect } from "react";
import {
  Brain,
  FileText,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Send,
  ShieldAlert,
  Globe,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { MedicalDocument, ViewTab } from "../../types/health.js";

interface SummaryViewProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ onNavigateTab }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [activeLangTab, setActiveLangTab] = useState<"en" | "hi">(language);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Q&A state
  const [questionInput, setQuestionInput] = useState<string>("");
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [qaHistory, setQaHistory] = useState<
    { question: string; answer: string; references: string[]; disclaimer: string }[]
  >([]);

  useEffect(() => {
    setActiveLangTab(language);
  }, [language]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0) {
          setSelectedDocId(data.documents[0].id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const extracted = currentDoc?.extractedData;

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || !currentDoc) return;

    const question = questionInput.trim();
    setQuestionInput("");
    setIsAsking(true);

    try {
      const res = await fetch(`/api/documents/${currentDoc.id}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language: activeLangTab }),
      });

      if (res.ok) {
        const data = await res.json();
        setQaHistory((prev) => [
          ...prev,
          {
            question,
            answer: data.answer,
            references: data.references || [currentDoc.title],
            disclaimer: data.disclaimer,
          },
        ]);
      }
    } catch (e) {
      console.error("QA request failed:", e);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Document Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#16B8A6]">
            <Brain className="w-3.5 h-3.5" />
            <span>{t("summaryTitle")}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#142238] dark:text-white tracking-tight">
            Multimodal Report Interpretation
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            Plain-language explanations generated with Gemini 3.8 Flash, strictly grounded in source documents
          </p>
        </div>

        {/* Document Selector & Bilingual Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {documents.length > 0 && (
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="text-xs font-semibold py-2 px-3.5 rounded-xl border border-[#E4EAF1] dark:border-slate-700 bg-[#F5F7FB] dark:bg-slate-800 text-[#142238] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#16B8A6] max-w-xs"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.documentDate})
                </option>
              ))}
            </select>
          )}

          {/* Bilingual Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#F5F7FB] dark:bg-slate-800 border border-[#E4EAF1] dark:border-slate-700">
            <button
              onClick={() => setActiveLangTab("en")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeLangTab === "en"
                  ? "bg-white dark:bg-[#101C31] text-[#16B8A6] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLangTab("hi")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeLangTab === "hi"
                  ? "bg-white dark:bg-[#101C31] text-[#16B8A6] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>
      </div>

      {currentDoc && extracted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 Cols): Clinical Explanation & Findings */}
          <div className="lg:col-span-7 space-y-6">
            {/* Plain Language Summary Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4EAF1] dark:border-[#1B2D48]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#16B8A6] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("plainLanguageSummary")}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentDoc.documentDate} · {currentDoc.facility || "Facility"}
                </span>
              </div>

              <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {activeLangTab === "hi" && extracted.plainSummaryHi ? (
                  <p className="font-normal">{extracted.plainSummaryHi}</p>
                ) : (
                  <p>{extracted.plainSummaryEn}</p>
                )}
              </div>

              {/* Explicit Diagnoses / Conditions */}
              {extracted.diagnoses.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                    Stated Diagnoses / Clinical Findings in Source:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {extracted.diagnoses.map((diag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 text-xs font-medium border border-teal-200 dark:border-teal-900"
                      >
                        {diag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Key Clinical Observations */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{t("keyFindings")}</span>
              </h3>

              <div className="space-y-2">
                {extracted.keyObservations.map((obs, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    {obs}
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Checklist */}
            {extracted.verificationNeeded.length > 0 && (
              <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{t("needsVerification")}</span>
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Please review the following items against your physical medical record:
                </p>
                <div className="space-y-2">
                  {extracted.verificationNeeded.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/50 text-xs text-slate-800 dark:text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions to Discuss With Clinician */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                <span>{t("clinicianQuestions")}</span>
              </h3>
              <div className="space-y-2">
                {extracted.questionsForClinician.map((q, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="font-mono text-teal-600 font-bold shrink-0">{i + 1}.</span>
                    <span className="leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 Cols): Grounded Document Q&A & Safety Disclaimers */}
          <div className="lg:col-span-5 space-y-6">
            {/* Grounded Document Q&A */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    <span>{t("askDocAi")}</span>
                  </h3>
                  <span className="text-[10px] text-teal-600 font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950">
                    Grounded QA
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  {t("answerGroundedNotice")}
                </p>

                {/* Q&A Stream */}
                <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
                  {qaHistory.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                      <Sparkles className="w-6 h-6 mx-auto text-slate-300" />
                      <p>Ask any question about this document.</p>
                      <p className="text-[11px] text-slate-400">
                        e.g., "What does my HbA1c result mean for daily diet?"
                      </p>
                    </div>
                  ) : (
                    qaHistory.map((item, idx) => (
                      <div key={idx} className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold">
                          Q: {item.question}
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
                          <p>{item.answer}</p>
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                            References: {item.references.join(", ")}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {isAsking && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-500 animate-pulse flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                      <span>Reviewing clinical document context...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Input */}
              <form onSubmit={handleAskQuestion} className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("askPlaceholder")}
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    disabled={isAsking}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isAsking || !questionInput.trim()}
                    className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 rounded-xl transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Medical Safety Notice Card */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-500" />
                <span>{t("safetyDisclaimerTitle")}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("safetyDisclaimerBody")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Brain className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Document Selected
          </h3>
          <p className="text-xs text-slate-500">
            Upload a document in the Medical Records section to view AI summaries.
          </p>
        </div>
      )}
    </div>
  );
};
