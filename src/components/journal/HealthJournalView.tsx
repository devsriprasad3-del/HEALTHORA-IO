import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Tag,
  Paperclip,
  Sparkles,
  HelpCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Brain,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { HealthJournalEntry, MedicalDocument, ViewTab } from "../../types/health.js";

interface HealthJournalViewProps {
  onNavigateTab: (tab: ViewTab) => void;
  onLaunchAIBotWithContext?: (pageContext: string, initialPrompt?: string) => void;
}

export const HealthJournalView: React.FC<HealthJournalViewProps> = ({
  onNavigateTab,
  onLaunchAIBotWithContext,
}) => {
  const { user, activeProfileKey } = useAuth();
  const { t, language } = useLanguage();

  const [entries, setEntries] = useState<HealthJournalEntry[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [entryTags, setEntryTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [clinicianQuestions, setClinicianQuestions] = useState<string[]>([]);
  const [questionInput, setQuestionInput] = useState("");
  const [attachedDocId, setAttachedDocId] = useState<string>("");

  const [generatingAiSummaryId, setGeneratingAiSummaryId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchJournalAndDocs = async () => {
    try {
      setLoading(true);
      const [jourRes, docsRes] = await Promise.all([
        fetch("/api/journal").then((r) => r.json()),
        fetch("/api/documents").then((r) => r.json()),
      ]);
      setEntries(jourRes.journalEntries || []);
      setDocuments(docsRes.documents || []);
    } catch (err) {
      console.error("Failed to load journal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalAndDocs();
  }, [activeProfileKey]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingEntryId(null);
    setEntryDate(new Date().toISOString().split("T")[0]);
    setEntryTitle("");
    setEntryContent("");
    setEntryTags(["Symptoms"]);
    setClinicianQuestions([]);
    setAttachedDocId("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (entry: HealthJournalEntry) => {
    setEditingEntryId(entry.id);
    setEntryDate(entry.date);
    setEntryTitle(entry.title);
    setEntryContent(entry.content);
    setEntryTags(entry.tags || []);
    setClinicianQuestions(entry.clinicianQuestions || []);
    setAttachedDocId(entry.attachedDocumentId || "");
    setIsModalOpen(true);
  };

  // Save Entry (Create / Update)
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryContent.trim()) {
      showToast("Title and symptoms content are required");
      return;
    }

    const attachedDoc = documents.find((d) => d.id === attachedDocId);

    const payload = {
      date: entryDate,
      title: entryTitle,
      content: entryContent,
      tags: entryTags,
      clinicianQuestions,
      attachedDocumentId: attachedDocId || undefined,
      attachedDocumentTitle: attachedDoc ? attachedDoc.title : undefined,
    };

    try {
      if (editingEntryId) {
        const res = await fetch(`/api/journal/${editingEntryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setEntries(entries.map((j) => (j.id === editingEntryId ? data.entry : j)));
          showToast("Journal entry updated");
        }
      } else {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setEntries([data.entry, ...entries]);
          showToast("Journal entry created");
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast("Failed to save journal entry");
    }
  };

  // Delete Entry
  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    try {
      await fetch(`/api/journal/${id}`, { method: "DELETE" });
      setEntries(entries.filter((j) => j.id !== id));
      showToast("Journal entry deleted");
    } catch (err) {
      showToast("Failed to delete entry");
    }
  };

  // Generate AI Plain Summary
  const handleGenerateAiSummary = async (id: string) => {
    try {
      setGeneratingAiSummaryId(id);
      const res = await fetch(`/api/journal/${id}/ai-summary`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setEntries(entries.map((j) => (j.id === id ? data.entry : j)));
        showToast(
          language === "hi"
            ? "एआई सारांश व परामर्श प्रश्न तैयार किए गए"
            : "AI Plain Summary & Doctor Appointment Talking Points generated"
        );
      }
    } catch (err) {
      showToast("Failed to generate AI summary");
    } finally {
      setGeneratingAiSummaryId(null);
    }
  };

  // Tag Helpers
  const handleAddTag = () => {
    if (tagInput.trim() && !entryTags.includes(tagInput.trim())) {
      setEntryTags([...entryTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEntryTags(entryTags.filter((t) => t !== tag));
  };

  // Question Helpers
  const handleAddQuestion = () => {
    if (questionInput.trim()) {
      setClinicianQuestions([...clinicianQuestions, questionInput.trim()]);
      setQuestionInput("");
    }
  };

  const handleRemoveQuestion = (idx: number) => {
    setClinicianQuestions(clinicianQuestions.filter((_, i) => i !== idx));
  };

  // Filtered entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === null || entry.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Extract all unique tags
  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags || [])));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-[#101C31] text-[#66E3D3] border border-[#16B8A6] text-xs font-bold shadow-xl">
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white dark:bg-[#101C31] p-6 rounded-2xl border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#16B8A6]">
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#142238] dark:text-white">
              {t("navJournal")}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("journalSubtitle")}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-all shadow-md active:scale-95 whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t("newJournalEntry")}</span>
        </button>
      </div>

      {/* Search and Tag Filter Bar */}
      <div className="bg-white dark:bg-[#101C31] p-4 rounded-xl border border-[#E4EAF1] dark:border-[#1B2D48] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchJournal")}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedTag === null
                  ? "bg-[#16B8A6] text-[#101C31]"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? "bg-[#16B8A6] text-[#101C31]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48]">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t("noEntriesFound")}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Organize your symptoms, questions for Dr. Verma, or dietary reactions ahead of your appointment.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-[#16B8A6] text-[#101C31] text-xs font-bold hover:bg-[#66E3D3] transition-colors"
            >
              Create First Entry
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-[#101C31] rounded-2xl p-6 border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm hover:border-[#16B8A6]/40 transition-all space-y-4"
            >
              {/* Entry Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#16B8A6]" />
                    <span>{entry.date}</span>
                    {entry.attachedDocumentTitle && (
                      <span className="flex items-center gap-1 text-[#16B8A6] font-sans font-bold">
                        • <Paperclip className="w-3 h-3" /> {entry.attachedDocumentTitle}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-extrabold text-[#142238] dark:text-white">
                    {entry.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleGenerateAiSummary(entry.id)}
                    disabled={generatingAiSummaryId === entry.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E6F8F4] dark:bg-[#172944] text-[#16B8A6] dark:text-[#66E3D3] text-xs font-bold hover:bg-[#d5f3ec] transition-colors"
                    title="Generate Plain-Language AI Summary"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {generatingAiSummaryId === entry.id
                        ? "Generating..."
                        : entry.aiSummaryEn
                        ? "Regenerate AI Summary"
                        : t("generateAISummary")}
                    </span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(entry)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Symptoms / User Words */}
              <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-[#F5F7FB] dark:bg-[#172944]/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  {language === "hi" ? "मरीज के अपने शब्दों में लक्षण:" : "Patient Reported Symptoms:"}
                </span>
                <p className="whitespace-pre-line">{entry.content}</p>
              </div>

              {/* Questions for Healthcare Professional */}
              {entry.clinicianQuestions && entry.clinicianQuestions.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 mb-2">
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                    <span>{t("clinicianQuestionsTitle")}</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-blue-950 dark:text-blue-200">
                    {entry.clinicianQuestions.map((q, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Plain Language Interpretation & Appointment Prep */}
              {entry.aiSummaryEn && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50/80 to-emerald-50/80 dark:from-[#172944] dark:to-[#102A45] border border-teal-200/80 dark:border-[#1B2D48] text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[#16B8A6]">
                      <Brain className="w-4 h-4" />
                      <span>
                        {language === "hi"
                          ? "एआई क्लिनिकल अनुवाद (मरीज के मूल अर्थ को संरक्षित करते हुए)"
                          : "AI Plain-Language Translation (Preserving Patient Context)"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Gemini 3.8 Flash</span>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {language === "hi" && entry.aiSummaryHi ? entry.aiSummaryHi : entry.aiSummaryEn}
                  </p>

                  {entry.appointmentPrepList && entry.appointmentPrepList.length > 0 && (
                    <div className="pt-2 border-t border-teal-100 dark:border-teal-900/50">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-[#16B8A6]" />
                        <span>Doctor Consultation Checklist:</span>
                      </span>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
                        {entry.appointmentPrepList.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {entry.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#101C31] w-full max-w-2xl rounded-2xl border border-[#E4EAF1] dark:border-[#1B2D48] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-extrabold text-[#142238] dark:text-white mb-4">
              {editingEntryId ? "Edit Journal Entry" : t("newJournalEntry")}
            </h2>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    className="w-full p-2.5 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Entry Title
                  </label>
                  <input
                    type="text"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    placeholder="e.g., Afternoon Dizziness After Fasted Walk"
                    required
                    className="w-full p-2.5 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Symptoms & Concerns (in your own words)
                </label>
                <textarea
                  rows={4}
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  placeholder="Describe exactly what you experienced, what time it occurred, what you ate, or what medications were taken..."
                  required
                  className="w-full p-3 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#16B8A6]"
                />
              </div>

              {/* Attach Medical Document */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t("attachDocument")} (Optional)
                </label>
                <select
                  value={attachedDocId}
                  onChange={(e) => setAttachedDocId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                >
                  <option value="">None attached</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title} ({doc.documentDate} - {doc.documentType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Questions for Doctor */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t("clinicianQuestionsTitle")}
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="e.g., Should I change the timing of my morning Metformin dose?"
                    className="flex-1 p-2 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-[#16B8A6] hover:text-[#101C31] transition-colors"
                  >
                    Add
                  </button>
                </div>

                {clinicianQuestions.length > 0 && (
                  <div className="space-y-1">
                    {clinicianQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
                      >
                        <span>• {q}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tags
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g., Blood Sugar, Dizziness, Walking"
                    className="flex-1 p-2 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-[#16B8A6] hover:text-[#101C31] transition-colors"
                  >
                    Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {entryTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#16B8A6]/20 text-[#16B8A6] text-[11px] font-bold"
                    >
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-all shadow-md"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
