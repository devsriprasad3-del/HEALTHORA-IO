import React, { useState, useEffect } from "react";
import {
  Moon,
  Droplets,
  Utensils,
  Activity,
  Smile,
  CheckCircle2,
  FileText,
  Bell,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  PlusCircle,
  Brain,
  Pill,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { ViewTab, DailySummary } from "../../types/health.js";

interface OverviewViewProps {
  onNavigateTab: (tab: ViewTab) => void;
  onOpenUploadModal: () => void;
  onOpenEmergencyModal?: () => void;
  onLaunchAIBotWithContext?: (pageContext: string, initialPrompt?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateTab,
  onOpenUploadModal,
  onOpenEmergencyModal,
  onLaunchAIBotWithContext,
}) => {
  const { user, activeProfileKey } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<any>(null);
  const [documentsCount, setDocumentsCount] = useState<number>(0);
  const [activeMedsCount, setActiveMedsCount] = useState<number>(0);
  const [remindersCount, setRemindersCount] = useState<number>(0);
  const [recentLabs, setRecentLabs] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dailyRes, docsRes, medsRes, remsRes, labsRes] = await Promise.all([
        fetch(`/api/tracking/daily?date=${todayStr}`)
          .then((r) => r.json())
          .catch(() => ({})),
        fetch("/api/documents")
          .then((r) => r.json())
          .catch(() => ({ documents: [] })),
        fetch("/api/medications")
          .then((r) => r.json())
          .catch(() => ({ medications: [] })),
        fetch("/api/reminders")
          .then((r) => r.json())
          .catch(() => ({ reminders: [] })),
        fetch("/api/labs")
          .then((r) => r.json())
          .catch(() => ({ labs: [] })),
      ]);

      setDailyData(dailyRes);
      setDocumentsCount((docsRes?.documents || []).length);
      setActiveMedsCount((medsRes?.medications || []).filter((m: any) => m.status === "Active").length);
      setRemindersCount(
        (remsRes?.reminders || []).filter((r: any) => r.enabled && !r.completed).length
      );
      setRecentLabs((labsRes?.labs || []).slice(0, 4));

      // Build truthful AI insights based on actual data
      const insights: string[] = [];
      const summary: DailySummary = dailyRes?.summary || {
        sleepHours: null,
        waterLoggedMl: 0,
        waterTargetMl: 2500,
        waterPercentage: 0,
        mealsLogged: 0,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        activityMinutes: 0,
        totalSteps: 0,
        mood: null,
        completionPercentage: 0,
      };

      if (summary.sleepHours !== null && summary.sleepHours !== undefined) {
        insights.push(
          language === "hi"
            ? `आज आपने ${summary.sleepHours} घंटे की नींद दर्ज की है।`
            : `You logged ${summary.sleepHours} hours of sleep for last night.`
        );
      } else {
        insights.push(
          language === "hi"
            ? `आज की नींद अभी दर्ज नहीं की गई है। सटीक ट्रैकिंग के लिए लॉग करें।`
            : `Last night's sleep is not logged yet. Recording regular sleep intervals helps track recovery.`
        );
      }

      if (summary.waterLoggedMl > 0) {
        insights.push(
          language === "hi"
            ? `आपने आज ${summary.waterLoggedMl} ml पानी पिया है (${summary.waterPercentage}% लक्ष्य पूर्ण)।`
            : `You have logged ${summary.waterLoggedMl} ml of water today (${summary.waterPercentage}% of your personal target).`
        );
      } else {
        insights.push(
          language === "hi"
            ? `आज का पानी अभी दर्ज नहीं किया गया है (दैनिक लक्ष्य: ${summary.waterTargetMl} ml)।`
            : `Water intake is not logged yet for today (Target: ${summary.waterTargetMl} ml).`
        );
      }

      if (summary.activityMinutes > 0) {
        insights.push(
          language === "hi"
            ? `आज ${summary.activityMinutes} मिनट का व्यायाम दर्ज किया गया (${summary.totalSteps} कदम)।`
            : `You logged ${summary.activityMinutes} minutes of physical activity today with ${summary.totalSteps} steps.`
        );
      }

      const abnormal = (labsRes?.labs || []).filter(
        (l: any) => l.sourceInterpretation !== "Within Normal Range"
      );
      if (abnormal.length > 0) {
        insights.push(
          language === "hi"
            ? `आपकी हालिया प्रयोगशाला रिपोर्ट में ${abnormal.length} परीक्षण संदर्भ सीमा से बाहर हैं (${abnormal[0].testName})।`
            : `Your recent lab results show ${abnormal.length} parameter(s) outside reference limits (${abnormal[0].testName}).`
        );
      }

      setAiInsights(insights);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeProfileKey, language]);

  const handleAskAIContext = (topicPrompt: string) => {
    if (onLaunchAIBotWithContext) {
      onLaunchAIBotWithContext("overview", topicPrompt);
    } else {
      onNavigateTab("ai_bots");
    }
  };

  const summary: DailySummary = dailyData?.summary || {
    sleepHours: null,
    waterLoggedMl: 0,
    waterTargetMl: 2500,
    waterPercentage: 0,
    mealsLogged: 0,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    activityMinutes: 0,
    totalSteps: 0,
    mood: null,
    completionPercentage: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. Header Banner & Profile Snapshot */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101C31] via-[#172944] to-[#102A45] text-white p-6 sm:p-8 shadow-xl border border-[#1B2D48]">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#16B8A6]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 rounded-full bg-[#66E3D3]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#16B8A6]/20 text-[#66E3D3] border border-[#16B8A6]/30">
                <Sparkles className="w-3 h-3" />
                Healthora 2.0 Wellness Intelligence
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t("greeting")}, <span className="text-[#66E3D3]">{user?.name || "Patient"}</span>
            </h1>

            <p className="mt-1 text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === "hi"
                ? "आपकी संपूर्ण स्वास्थ्य समयरेखा, दैनिक ट्रैकिंग, लैब रुझान और एआई सहायक एक सुरक्षित स्थान पर।"
                : "Your comprehensive clinical timeline, daily wellness logs, lab trajectories, and AI Bots in one unified workspace."}
            </p>

            {user?.chronicConditions && user.chronicConditions.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">
                  {language === "hi" ? "सक्रिय स्थितियां:" : "Tracked Conditions:"}
                </span>
                {user.chronicConditions.map((cond) => (
                  <span
                    key={cond}
                    className="px-2 py-0.5 rounded-md bg-[#1B2D48] text-slate-200 border border-[#233a5d] text-[11px]"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab("tracking")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === "hi" ? "दैनिक ट्रैकिंग दर्ज करें" : "Log Daily Wellness"}</span>
            </button>

            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-[#66E3D3]" />
              <span>{t("uploadReport")}</span>
            </button>

            <button
              onClick={() => onNavigateTab("ai_bots")}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#172944] hover:bg-[#203658] text-[#66E3D3] border border-[#16B8A6]/40 font-semibold text-xs transition-all active:scale-95 whitespace-nowrap"
              title="Open AI Bots Assistant"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Bots</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Metric Summary Cards (Calculated strictly from actual records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sleep Duration */}
        <div className="bg-white dark:bg-[#101C31] rounded-2xl p-5 border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm hover:border-[#16B8A6]/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t("sleepDuration")}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#142238] dark:text-white">
                  {summary.sleepHours !== null ? `${summary.sleepHours}` : "—"}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {summary.sleepHours !== null ? "hrs" : "No entry"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                {dailyData?.sleep
                  ? `Bed: ${dailyData.sleep.bedtime} • Wake: ${dailyData.sleep.wakeTime} (${dailyData.sleep.quality})`
                  : language === "hi"
                  ? "आज की नींद दर्ज नहीं है"
                  : "Not logged yet today"}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab("tracking")}
              className="text-[#16B8A6] hover:text-[#0d9488] font-bold inline-flex items-center gap-1 group-hover:underline"
            >
              <span>{t("viewDetails")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAskAIContext("Summarize my sleep trends this week and clinical recommendations.")}
              className="text-slate-400 hover:text-[#16B8A6] text-[11px] font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#16B8A6]" />
              <span>{t("askAI")}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Water Intake */}
        <div className="bg-white dark:bg-[#101C31] rounded-2xl p-5 border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm hover:border-[#16B8A6]/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#16B8A6] flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t("waterIntake")}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#142238] dark:text-white">
                  {summary.waterLoggedMl}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  / {summary.waterTargetMl} ml
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#16B8A6] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, summary.waterPercentage)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {summary.waterPercentage}% {language === "hi" ? "दैनिक लक्ष्य" : "of daily target"}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab("tracking")}
              className="text-[#16B8A6] hover:text-[#0d9488] font-bold inline-flex items-center gap-1 group-hover:underline"
            >
              <span>{t("viewDetails")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAskAIContext("How much water have I logged today and how does it compare to my goal?")}
              className="text-slate-400 hover:text-[#16B8A6] text-[11px] font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#16B8A6]" />
              <span>{t("askAI")}</span>
            </button>
          </div>
        </div>

        {/* Card 3: Activity Duration */}
        <div className="bg-white dark:bg-[#101C31] rounded-2xl p-5 border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm hover:border-[#16B8A6]/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t("activityDuration")}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#142238] dark:text-white">
                  {summary.activityMinutes}
                </span>
                <span className="text-xs text-slate-500 font-semibold">mins active</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {summary.totalSteps > 0 ? `${summary.totalSteps.toLocaleString()} steps recorded` : "No steps logged today"}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab("tracking")}
              className="text-[#16B8A6] hover:text-[#0d9488] font-bold inline-flex items-center gap-1 group-hover:underline"
            >
              <span>{t("viewDetails")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAskAIContext("Summarize my physical activity this week and step count.")}
              className="text-slate-400 hover:text-[#16B8A6] text-[11px] font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#16B8A6]" />
              <span>{t("askAI")}</span>
            </button>
          </div>
        </div>

        {/* Card 4: Daily Tracking Completion */}
        <div className="bg-white dark:bg-[#101C31] rounded-2xl p-5 border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm hover:border-[#16B8A6]/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t("trackingCompletion")}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#142238] dark:text-white">
                  {summary.completionPercentage}%
                </span>
                <span className="text-xs text-slate-500 font-semibold">today</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${summary.completionPercentage}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {summary.completionPercentage === 100
                  ? (language === "hi" ? "सभी 5 श्रेणियां पूर्ण!" : "All 5 categories logged!")
                  : (language === "hi" ? "नींद, पानी, भोजन, व्यायाम, मनोदशा" : "Sleep, water, meals, activity, mood")}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab("tracking")}
              className="text-[#16B8A6] hover:text-[#0d9488] font-bold inline-flex items-center gap-1 group-hover:underline"
            >
              <span>{t("viewDetails")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAskAIContext("Which tracking entries are missing for today?")}
              className="text-slate-400 hover:text-[#16B8A6] text-[11px] font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#16B8A6]" />
              <span>{t("askAI")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Secondary Metrics: Documents, Medications, Reminders, Nutrition */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigateTab("records")}
          className="p-4 rounded-xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] text-left hover:border-[#16B8A6]/40 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <FileText className="w-4 h-4 text-[#16B8A6]" />
            <span>{t("totalDocuments")}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#142238] dark:text-white">
            {documentsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {language === "hi" ? "सत्यापित रिकॉर्ड" : "Verified records"}
          </div>
        </button>

        <button
          onClick={() => onNavigateTab("medications")}
          className="p-4 rounded-xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] text-left hover:border-[#16B8A6]/40 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <Pill className="w-4 h-4 text-emerald-500" />
            <span>{t("activeMeds")}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#142238] dark:text-white">
            {activeMedsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {language === "hi" ? "सक्रिय पर्चियां" : "Current therapies"}
          </div>
        </button>

        <button
          onClick={() => onNavigateTab("reminders")}
          className="p-4 rounded-xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] text-left hover:border-[#16B8A6]/40 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <Bell className="w-4 h-4 text-rose-500" />
            <span>{t("upcomingReminders")}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#142238] dark:text-white">
            {remindersCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {language === "hi" ? "लंबित शेड्यूल" : "Scheduled pending"}
          </div>
        </button>

        <button
          onClick={() => onNavigateTab("tracking")}
          className="p-4 rounded-xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] text-left hover:border-[#16B8A6]/40 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <Utensils className="w-4 h-4 text-orange-500" />
            <span>{t("mealsLogged")}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#142238] dark:text-white">
            {summary.mealsLogged}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {summary.totalCalories > 0 ? `${summary.totalCalories} kcal logged` : "No meals logged"}
          </div>
        </button>
      </div>

      {/* 4. AI Grounded Insights Section */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-white via-white to-teal-50/40 dark:from-[#101C31] dark:via-[#101C31] dark:to-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16B8A6]/10 text-[#16B8A6] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#142238] dark:text-white">
                {t("aiInsightsTitle")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("aiInsightsDescription")}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAskAIContext("Generate a structured executive clinical summary of my health portfolio.")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E6F8F4] dark:bg-[#172944] text-[#16B8A6] dark:text-[#66E3D3] text-xs font-bold hover:bg-[#d5f3ec] transition-colors"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "एआई बॉट्स में विस्तार से देखें" : "Explore with AI Bots"}</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#172944]/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#16B8A6] shrink-0 mt-1.5" />
              <span className="leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Two Columns: Recent Laboratory Trajectory & Quick Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Laboratory Trajectory */}
        <div className="lg:col-span-2 bg-white dark:bg-[#101C31] rounded-2xl p-6 border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#142238] dark:text-white">
                {language === "hi" ? "हालिया प्रयोगशाला परिणाम" : "Recent Laboratory Observations"}
              </h2>
              <p className="text-xs text-slate-400">
                {language === "hi"
                  ? "सत्यापित स्रोत संदर्भ सीमाओं के साथ वास्तविक परीक्षण परिणाम"
                  : "Extracted directly from verified pathology reports"}
              </p>
            </div>

            <button
              onClick={() => onNavigateTab("labs")}
              className="text-xs font-bold text-[#16B8A6] hover:underline flex items-center gap-1"
            >
              <span>{language === "hi" ? "सभी देखें" : "View All"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentLabs.map((lab: any) => {
              const isNormal = lab.sourceInterpretation === "Within Normal Range";
              return (
                <div
                  key={lab.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#172944]/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="min-w-0 pr-3">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {lab.testName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Ref: {lab.referenceRangeText} • Observed: {lab.observedDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-black text-sm text-[#142238] dark:text-white">
                        {lab.valueText} <span className="text-[11px] font-normal text-slate-500">{lab.unit}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isNormal
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {lab.sourceInterpretation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Module Launcher */}
        <div className="bg-white dark:bg-[#101C31] rounded-2xl p-6 border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#142238] dark:text-white mb-1">
              {language === "hi" ? "त्वरित नेविगेशन" : "Healthora 2.0 Hub"}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              {language === "hi" ? "सभी एकीकृत स्वास्थ्य मॉड्यूल" : "Access all upgraded intelligence modules"}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab("journal")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#E6F8F4] dark:bg-[#172944] dark:hover:bg-[#1B2D48] transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-[#16B8A6]">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  <span>{t("navJournal")}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab("analytics")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#E6F8F4] dark:bg-[#172944] dark:hover:bg-[#1B2D48] transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-500">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                  <span>{t("navAnalytics")}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab("reminders")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#E6F8F4] dark:bg-[#172944] dark:hover:bg-[#1B2D48] transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-500">
                    <Bell className="w-3.5 h-3.5" />
                  </span>
                  <span>{t("navReminders")}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab("settings")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#E6F8F4] dark:bg-[#172944] dark:hover:bg-[#1B2D48] transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-500">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                  <span>{t("navSettings")}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-bold mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{language === "hi" ? "चिकित्सा सूचना प्रकटीकरण" : "Clinical Information Notice"}</span>
            </div>
            <p className="leading-relaxed">
              {language === "hi"
                ? "हेल्थोरा स्वास्थ्य डेटा संगठन व शैक्षिक अंतर्दृष्टि प्रदान करता है। यह चिकित्सा निदान का विकल्प नहीं है।"
                : "Healthora organizes health information and offers educational clarity. Always consult your doctor for medical diagnoses."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
