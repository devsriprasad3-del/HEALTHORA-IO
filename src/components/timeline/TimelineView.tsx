import React, { useState, useEffect } from "react";
import {
  Clock,
  FileText,
  FlaskConical,
  Pill,
  HeartPulse,
  StickyNote,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { TimelineEvent, ViewTab } from "../../types/health.js";

interface TimelineViewProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onNavigateTab }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch("/api/timeline");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.timeline || []);
      }
    } catch (e) {
      console.error("Failed to load timeline:", e);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [user]);

  const filteredEvents = events.filter((e) => {
    const matchesType = filterType === "all" || e.type === filterType;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    await fetch("/api/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: noteDate,
        type: "clinical_note",
        title: noteTitle,
        summary: noteContent || "Patient symptom or clinical self-observation.",
        summaryHi: noteContent || "मरीज द्वारा दर्ज किया गया व्यक्तिगत स्वास्थ्य विवरण।",
      }),
    });

    setAddNoteModalOpen(false);
    setNoteTitle("");
    setNoteContent("");
    fetchTimeline();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="w-4 h-4 text-teal-600" />;
      case "lab":
        return <FlaskConical className="w-4 h-4 text-teal-600" />;
      case "medication":
        return <Pill className="w-4 h-4 text-purple-600" />;
      case "wellness":
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case "clinical_note":
      default:
        return <StickyNote className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#16B8A6]">
            <Clock className="w-3.5 h-3.5" />
            <span>{t("navTimeline")}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#142238] dark:text-white mt-0.5 tracking-tight">
            {t("timelineTitle")}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Chronological provenance of diagnostic reports, therapy changes, and personal health observations
          </p>
        </div>

        <button
          onClick={() => setAddNoteModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t("addNote")}</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search timeline events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: "all", label: t("filterAll") },
            { id: "document", label: t("filterDocuments") },
            { id: "lab", label: t("filterLabs") },
            { id: "medication", label: t("filterMedications") },
            { id: "wellness", label: t("filterWellness") },
            { id: "clinical_note", label: t("filterNotes") },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === cat.id
                  ? "bg-teal-500 text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Feed */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline Node Dot */}
            <div className="absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-500 flex items-center justify-center shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
            </div>

            {/* Event Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {getEventIcon(event.type)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {event.date}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 pl-9">
                {language === "hi" && event.summaryHi ? event.summaryHi : event.summary}
              </p>

              {event.documentId && (
                <div className="pl-9 pt-1">
                  <button
                    onClick={() => onNavigateTab("summary")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    <span>View associated source analysis</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400">
            No events found matching your filter.
          </div>
        )}
      </div>

      {/* Add Clinical Note Modal */}
      {addNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("addNote")}
                </h3>
                <p className="text-xs text-slate-500">Record a symptom, blood sugar test, or clinical visit</p>
              </div>
              <button
                onClick={() => setAddNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Home Capillary Blood Glucose Check"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Details / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Fasting glucose measured 126 mg/dL at 7:30 AM before breakfast."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-sm transition-colors"
                >
                  Save to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
