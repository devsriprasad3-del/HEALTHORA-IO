import React, { useState, useEffect } from "react";
import {
  Moon,
  Droplets,
  Utensils,
  Activity,
  Smile,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  Flame,
  ArrowUpRight,
  Save,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import {
  SleepEntry,
  WaterEntry,
  MealEntry,
  ActivityEntry,
  MoodEntry,
  ViewTab,
} from "../../types/health.js";

interface DailyTrackingViewProps {
  onNavigateTab: (tab: ViewTab) => void;
  onLaunchAIBotWithContext?: (pageContext: string, initialPrompt?: string) => void;
}

export const DailyTrackingView: React.FC<DailyTrackingViewProps> = ({
  onNavigateTab,
  onLaunchAIBotWithContext,
}) => {
  const { user, activeProfileKey } = useAuth();
  const { t, language } = useLanguage();

  // Selected Tracking Date (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Active sub-tab
  const [activeTracker, setActiveTracker] = useState<"sleep" | "water" | "meals" | "activity" | "mood">("sleep");

  // Daily State
  const [sleep, setSleep] = useState<SleepEntry | null>(null);
  const [water, setWater] = useState<WaterEntry>({
    id: "",
    userId: "",
    date: selectedDate,
    amountMl: 0,
    unit: "ml",
    targetMl: 2500,
    createdAt: "",
  });
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [mood, setMood] = useState<MoodEntry | null>(null);

  // Form states
  // Sleep Form
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepQuality, setSleepQuality] = useState<"poor" | "fair" | "good" | "excellent">("good");
  const [sleepNotes, setSleepNotes] = useState("");

  // Water Form
  const [waterUnit, setWaterUnit] = useState<"ml" | "l">("ml");
  const [customWaterMl, setCustomWaterMl] = useState<number>(250);

  // Meal Form
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [mealName, setMealName] = useState("");
  const [foods, setFoods] = useState("");
  const [mealCalories, setMealCalories] = useState<string>("");
  const [mealProtein, setMealProtein] = useState<string>("");
  const [mealCarbs, setMealCarbs] = useState<string>("");
  const [mealFat, setMealFat] = useState<string>("");
  const [isAiEstimated, setIsAiEstimated] = useState(false);
  const [estimatingNutrition, setEstimatingNutrition] = useState(false);

  // Activity Form
  const [activityType, setActivityType] = useState("Brisk Walking");
  const [durationMins, setDurationMins] = useState<number>(30);
  const [actSteps, setActSteps] = useState<string>("3500");
  const [actDistance, setActDistance] = useState<string>("2.5");
  const [actIntensity, setActIntensity] = useState<"low" | "medium" | "high">("medium");
  const [actCalories, setActCalories] = useState<string>("150");
  const [actNotes, setActNotes] = useState("");

  // Mood Form
  const [selectedMood, setSelectedMood] = useState<"great" | "good" | "neutral" | "low" | "stressed" | "anxious">("good");
  const [moodNotes, setMoodNotes] = useState("");

  // Helper to calculate duration accurately
  const computeDurationHours = (bed: string, wake: string) => {
    const [bH, bM] = bed.split(":").map(Number);
    const [wH, wM] = wake.split(":").map(Number);
    let bedTotal = bH * 60 + bM;
    let wakeTotal = wH * 60 + wM;
    if (wakeTotal < bedTotal) {
      wakeTotal += 24 * 60; // Crosses midnight
    }
    const diff = wakeTotal - bedTotal;
    return Math.round((diff / 60) * 100) / 100;
  };

  // Fetch entries for selectedDate
  const fetchDateEntries = async (date: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tracking/daily?date=${date}`);
      const data = await res.json();

      setSleep(data?.sleep || null);
      if (data?.sleep) {
        setBedtime(data.sleep.bedtime || "22:30");
        setWakeTime(data.sleep.wakeTime || "06:30");
        setSleepQuality(data.sleep.quality || "good");
        setSleepNotes(data.sleep.notes || "");
      }

      setWater(
        data?.water || {
          id: "water-" + date,
          userId: user?.id || "",
          date,
          amountMl: 0,
          unit: "ml",
          targetMl: 2500,
          createdAt: new Date().toISOString(),
        }
      );
      setMeals(data?.meals || []);
      setActivities(data?.activity || data?.activities || []);
      setMood(data?.mood || null);
      if (data?.mood) {
        setSelectedMood(data.mood.mood || "good");
        setMoodNotes(data.mood.notes || "");
      }
    } catch (err) {
      console.error("Failed to load daily tracking:", err);
      showToast("Failed to load tracking data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDateEntries(selectedDate);
  }, [selectedDate, activeProfileKey]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Date Navigation
  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  // 1. SAVE SLEEP
  const handleSaveSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tracking/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          bedtime,
          wakeTime,
          quality: sleepQuality,
          notes: sleepNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSleep(data.entry);
        showToast(
          language === "hi"
            ? `नींद सहेजी गई (${data.entry.durationHours} घंटे)`
            : `Sleep entry saved (${data.entry.durationHours} hrs duration)`
        );
      } else {
        showToast(data.error || "Failed to save sleep", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save sleep", "error");
    }
  };

  // 2. WATER LOGGING
  const handleAddWater = async (amountToAdd: number) => {
    const currentAmount = water ? water.amountMl : 0;
    const newAmount = Math.max(0, currentAmount + amountToAdd);
    try {
      const res = await fetch("/api/tracking/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          amountMl: newAmount,
          unit: "ml",
          targetMl: water.targetMl || 2500,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWater(data.entry);
        showToast(
          language === "hi"
            ? `पानी अपडेट किया गया: ${newAmount} ml`
            : `Water intake updated to ${newAmount} ml`
        );
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update water", "error");
    }
  };

  // 3. MEALS & NUTRITION
  const handleEstimateNutrition = async () => {
    if (!foods.trim()) {
      showToast(language === "hi" ? "कृपया भोजन का विवरण दर्ज करें" : "Enter food description first", "error");
      return;
    }
    try {
      setEstimatingNutrition(true);
      const res = await fetch("/api/tracking/ai-estimate-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealName, foods }),
      });
      const data = await res.json();
      if (data.success) {
        setMealCalories(data.calories.toString());
        setMealProtein(data.proteinG.toString());
        setMealCarbs(data.carbsG.toString());
        setMealFat(data.fatG.toString());
        setIsAiEstimated(true);
        showToast(
          language === "hi"
            ? "एआई द्वारा पोषण अनुमानित किया गया (अनुमानित बैज जोड़ा गया)"
            : "Nutrition values estimated by Gemini (Clearly marked as AI Estimated)"
        );
      }
    } catch (err) {
      showToast("Failed to estimate nutrition", "error");
    } finally {
      setEstimatingNutrition(false);
    }
  };

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !foods.trim()) {
      showToast("Meal name and foods are required", "error");
      return;
    }
    try {
      const res = await fetch("/api/tracking/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealType,
          mealName,
          foods,
          calories: mealCalories ? Number(mealCalories) : undefined,
          proteinG: mealProtein ? Number(mealProtein) : undefined,
          carbsG: mealCarbs ? Number(mealCarbs) : undefined,
          fatG: mealFat ? Number(mealFat) : undefined,
          isAiEstimated,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMeals([data.entry, ...meals]);
        setMealName("");
        setFoods("");
        setMealCalories("");
        setMealProtein("");
        setMealCarbs("");
        setMealFat("");
        setIsAiEstimated(false);
        showToast(language === "hi" ? "भोजन सफलतापूर्वक दर्ज किया गया" : "Meal logged successfully");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save meal", "error");
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await fetch(`/api/tracking/meals/${id}`, { method: "DELETE" });
      setMeals(meals.filter((m) => m.id !== id));
      showToast("Meal entry removed");
    } catch (err) {
      showToast("Failed to remove meal", "error");
    }
  };

  // 4. ACTIVITY
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tracking/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          activityType,
          durationMinutes: durationMins,
          steps: actSteps ? Number(actSteps) : undefined,
          distanceKm: actDistance ? Number(actDistance) : undefined,
          intensity: actIntensity,
          caloriesBurned: actCalories ? Number(actCalories) : undefined,
          notes: actNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActivities([data.entry, ...activities]);
        setActNotes("");
        showToast(language === "hi" ? "व्यायाम दर्ज किया गया" : "Activity saved successfully");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save activity", "error");
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await fetch(`/api/tracking/activity/${id}`, { method: "DELETE" });
      setActivities(activities.filter((a) => a.id !== id));
      showToast("Activity entry removed");
    } catch (err) {
      showToast("Failed to remove activity", "error");
    }
  };

  // 5. MOOD
  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tracking/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mood: selectedMood,
          notes: moodNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMood(data.entry);
        showToast(language === "hi" ? "मनोदशा दर्ज की गई" : "Mood journal entry saved");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save mood", "error");
    }
  };

  const calculatedSleepPreview = computeDurationHours(bedtime, wakeTime);

  // Daily totals
  const totalMealCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalActMins = activities.reduce((sum, a) => sum + a.durationMinutes, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-xs font-bold transition-all ${
            statusMessage.type === "success"
              ? "bg-[#101C31] text-[#66E3D3] border border-[#16B8A6]"
              : "bg-rose-900 text-white border border-rose-500"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-[#16B8A6]" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Date Bar & Overview Header */}
      <div className="bg-white dark:bg-[#101C31] p-4 sm:p-6 rounded-2xl border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#16B8A6]/10 text-[#16B8A6]">
              <Activity className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#142238] dark:text-white">
              {t("navTracking")}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("trackingSubtitle")}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#F5F7FB] dark:bg-[#172944] p-1.5 rounded-xl border border-[#E4EAF1] dark:border-[#1B2D48]">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1B2D48] text-slate-600 dark:text-slate-300 transition-colors"
            title="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-4 h-4 text-[#16B8A6]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#142238] dark:text-white focus:outline-none"
            />
          </div>

          <button
            onClick={() => changeDateByDays(1)}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#1B2D48] text-slate-600 dark:text-slate-300 transition-colors"
            title="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="ml-1 text-[11px] font-bold px-2 py-1 rounded-md bg-[#16B8A6] text-[#101C31] hover:bg-[#66E3D3] transition-colors"
          >
            {language === "hi" ? "आज" : "Today"}
          </button>
        </div>
      </div>

      {/* Tracker Sub-tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "sleep", label: t("sleepTracker"), icon: Moon, count: sleep ? `${sleep.durationHours}h` : null },
          { id: "water", label: t("waterTracker"), icon: Droplets, count: `${water.amountMl}ml` },
          { id: "meals", label: t("mealsNutrition"), icon: Utensils, count: meals.length > 0 ? `${meals.length}` : null },
          { id: "activity", label: t("activityTracker"), icon: Activity, count: activities.length > 0 ? `${totalActMins}m` : null },
          { id: "mood", label: t("moodJournal"), icon: Smile, count: mood ? mood.mood : null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTracker === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTracker(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#16B8A6] text-[#101C31] shadow-md scale-100"
                  : "bg-white dark:bg-[#101C31] text-slate-600 dark:text-slate-300 border border-[#E4EAF1] dark:border-[#1B2D48] hover:bg-slate-50 dark:hover:bg-[#172944]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md uppercase font-extrabold ${
                    isActive ? "bg-[#101C31]/20 text-[#101C31]" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TRACKER PANELS */}
      <div className="bg-white dark:bg-[#101C31] rounded-2xl p-6 sm:p-8 border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm">
        {/* ================= 1. SLEEP TRACKER ================= */}
        {activeTracker === "sleep" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-[#142238] dark:text-white flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <span>{t("sleepTracker")}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === "hi"
                    ? "सोने का समय, जागने का समय और नींद की गुणवत्ता दर्ज करें। आधी रात का अंतराल स्वचालित रूप से गणना होता है।"
                    : "Log bedtime and wake-up times. Overnight intervals crossing midnight are accurately computed."}
                </p>
              </div>

              {sleep && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === "hi" ? "इस तारीख के लिए दर्ज है" : "Logged for this date"}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSleep} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Bedtime */}
                <div className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48]">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    {t("bedtime")}
                  </label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    required
                    className="w-full text-lg font-black bg-transparent text-[#142238] dark:text-white focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">e.g., 23:15</span>
                </div>

                {/* Wake-up Time */}
                <div className="p-4 rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48]">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    {t("wakeTime")}
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    required
                    className="w-full text-lg font-black bg-transparent text-[#142238] dark:text-white focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">e.g., 07:00</span>
                </div>

                {/* Computed Duration Preview */}
                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                      {language === "hi" ? "गणना की गई अवधि" : "Computed Duration"}
                    </label>
                    <div className="text-2xl font-black text-indigo-950 dark:text-indigo-200">
                      {calculatedSleepPreview} <span className="text-xs font-normal">hours</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                    {calculatedSleepPreview >= 7 && calculatedSleepPreview <= 9
                      ? "Healthy adult restorative sleep range"
                      : "Outside standard 7-9 hr recommendation"}
                  </span>
                </div>
              </div>

              {/* Subjective Sleep Quality */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  {t("sleepQuality")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(["poor", "fair", "good", "excellent"] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSleepQuality(q)}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-center capitalize ${
                        sleepQuality === q
                          ? "bg-[#16B8A6] text-[#101C31] border-[#16B8A6] shadow-sm font-black"
                          : "bg-[#F5F7FB] dark:bg-[#172944] text-slate-600 dark:text-slate-300 border-[#E4EAF1] dark:border-[#1B2D48] hover:border-slate-400"
                      }`}
                    >
                      {q === "poor" && "😞 "}
                      {q === "fair" && "😐 "}
                      {q === "good" && "😊 "}
                      {q === "excellent" && "🌟 "}
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {language === "hi" ? "वैकल्पिक टिप्पणी" : "Subjective Notes (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={sleepNotes}
                  onChange={(e) => setSleepNotes(e.target.value)}
                  placeholder={
                    language === "hi"
                      ? "उदा. रात में 1 बार पानी के लिए जागे, कमरा शांत था..."
                      : "e.g., Felt well rested, woke up once around 3 AM for water..."
                  }
                  className="w-full p-3 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#16B8A6]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-all shadow-md active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{t("logSleep")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLaunchAIBotWithContext?.("tracking", "Summarize my sleep trends over the past 7 days.")}
                  className="text-xs font-bold text-[#16B8A6] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "एआई से नींद सारांश पूछें" : "Ask AI to analyze sleep trends"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= 2. WATER TRACKER ================= */}
        {activeTracker === "water" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-[#142238] dark:text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-[#16B8A6]" />
                  <span>{t("waterTracker")}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === "hi"
                    ? "दैनिक पानी की मात्रा दर्ज करें। व्यक्तिगत लक्ष्य के अनुसार प्रगति देखें।"
                    : "Track daily water hydration. Adjust units and add quick standard servings."}
                </p>
              </div>

              {/* Millilitres / Litres toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setWaterUnit("ml")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    waterUnit === "ml" ? "bg-white dark:bg-[#101C31] text-[#16B8A6] shadow-xs" : "text-slate-400"
                  }`}
                >
                  Millilitres (ml)
                </button>
                <button
                  onClick={() => setWaterUnit("l")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    waterUnit === "l" ? "bg-white dark:bg-[#101C31] text-[#16B8A6] shadow-xs" : "text-slate-400"
                  }`}
                >
                  Litres (L)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Progress Display */}
              <div className="md:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-[#172944] dark:to-[#102A45] border border-teal-100 dark:border-[#1B2D48] text-center flex flex-col items-center justify-center">
                <div className="w-28 h-28 rounded-full border-8 border-teal-200 dark:border-teal-900/60 border-t-[#16B8A6] flex flex-col items-center justify-center shadow-inner">
                  <span className="text-2xl font-black text-[#142238] dark:text-white">
                    {waterUnit === "l" ? (water.amountMl / 1000).toFixed(2) : water.amountMl}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{waterUnit}</span>
                </div>

                <div className="mt-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {Math.min(100, Math.round((water.amountMl / (water.targetMl || 2500)) * 100))}%{" "}
                  <span className="text-slate-400 font-normal">
                    of {waterUnit === "l" ? (water.targetMl / 1000).toFixed(1) : water.targetMl} {waterUnit} target
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {language === "hi" ? "त्वरित मात्रा जोड़ें:" : "Quick Servings:"}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handleAddWater(250)}
                    className="p-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-[#16B8A6] border border-teal-200 dark:border-teal-900 font-bold text-xs flex flex-col items-center gap-1 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+250 ml</span>
                    <span className="text-[10px] text-slate-400 font-normal">Glass</span>
                  </button>

                  <button
                    onClick={() => handleAddWater(500)}
                    className="p-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-[#16B8A6] border border-teal-200 dark:border-teal-900 font-bold text-xs flex flex-col items-center gap-1 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+500 ml</span>
                    <span className="text-[10px] text-slate-400 font-normal">Standard Bottle</span>
                  </button>

                  <button
                    onClick={() => handleAddWater(750)}
                    className="p-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-[#16B8A6] border border-teal-200 dark:border-teal-900 font-bold text-xs flex flex-col items-center gap-1 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+750 ml</span>
                    <span className="text-[10px] text-slate-400 font-normal">Large Bottle</span>
                  </button>

                  <button
                    onClick={() => handleAddWater(-250)}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs flex flex-col items-center gap-1 active:scale-95 transition-all"
                  >
                    <span>-250 ml</span>
                    <span className="text-[10px] text-slate-400 font-normal">Undo</span>
                  </button>
                </div>

                {/* Custom Amount */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={customWaterMl}
                      onChange={(e) => setCustomWaterMl(Number(e.target.value))}
                      placeholder="Custom ml (e.g., 300)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">ml</span>
                  </div>
                  <button
                    onClick={() => handleAddWater(customWaterMl)}
                    className="px-4 py-2 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] text-xs font-bold whitespace-nowrap active:scale-95 transition-all"
                  >
                    {language === "hi" ? "जोड़ें" : "Add Custom Amount"}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {language === "hi"
                      ? "व्यक्तिगत लक्ष्य आपकी प्राथमिकताओं से लिया गया है। यह व्यक्तिगत चिकित्सा सलाह नहीं है।"
                      : "Targets are personalized in your settings. Water intake needs vary based on climate and activity."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. MEALS & NUTRITION ================= */}
        {activeTracker === "meals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-[#142238] dark:text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  <span>{t("mealsNutrition")}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === "hi"
                    ? "खाद्य सामग्री और मैक्रोन्यूट्रिएंट्स दर्ज करें। उपयोगकर्ता-दर्ज और एआई-अनुमानित मान स्पष्ट रूप से पृथक हैं।"
                    : "Log foods and portions. User-entered nutrition is strictly distinguished from AI-estimated values."}
                </p>
              </div>

              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {language === "hi" ? "कुल कैलोरी:" : "Total Today:"}{" "}
                <span className="text-[#16B8A6] font-black">{totalMealCalories} kcal</span>
              </div>
            </div>

            {/* Meal Form */}
            <form onSubmit={handleSaveMeal} className="space-y-4 p-5 rounded-xl bg-slate-50 dark:bg-[#172944]/60 border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === "hi" ? "भोजन प्रकार" : "Meal Type"}
                  </label>
                  <select
                    value={mealType}
                    onChange={(e: any) => setMealType(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  >
                    <option value="breakfast">Breakfast (नाश्ता)</option>
                    <option value="lunch">Lunch (दोपहर का भोजन)</option>
                    <option value="dinner">Dinner (रात का भोजन)</option>
                    <option value="snack">Snack (हल्का नाश्ता)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("mealName")}
                  </label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="e.g., Vegetable Upma & Boiled Egg"
                    required
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t("foodsPortions")}
                  </label>
                  <button
                    type="button"
                    onClick={handleEstimateNutrition}
                    disabled={estimatingNutrition}
                    className="text-[11px] font-bold text-[#16B8A6] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{estimatingNutrition ? "Estimating..." : t("aiEstimate")}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={foods}
                  onChange={(e) => setFoods(e.target.value)}
                  placeholder="e.g., 1 bowl oats with mixed carrots and beans, 1 hard boiled egg, unsweetened tea"
                  required
                  className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                />
              </div>

              {/* Nutrition Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Calories (kcal)</label>
                  <input
                    type="number"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(e.target.value)}
                    placeholder="e.g., 340"
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    placeholder="e.g., 15"
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mealCarbs}
                    onChange={(e) => setMealCarbs(e.target.value)}
                    placeholder="e.g., 42"
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mealFat}
                    onChange={(e) => setMealFat(e.target.value)}
                    placeholder="e.g., 9"
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {isAiEstimated && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>These values are AI-estimated by Gemini based on food description. Not a clinical measurement.</span>
                </div>
              )}

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{t("logMeal")}</span>
              </button>
            </form>

            {/* List of Logged Meals */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === "hi" ? "आज दर्ज भोजन:" : "Logged Meals for this Date:"}
              </h3>

              {meals.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-[#172944]/40 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  No meal entries recorded for {selectedDate}. Use the form above to log breakfast, lunch, or dinner.
                </div>
              ) : (
                meals.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#142238] dark:text-white">{m.mealName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300">
                          {m.mealType}
                        </span>
                        {m.isAiEstimated ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {t("aiEstimatedBadge")}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
                            {t("userEnteredBadge")}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">{m.foods}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {m.calories !== undefined && <span>{m.calories} kcal</span>}
                        {m.proteinG !== undefined && <span>• P: {m.proteinG}g</span>}
                        {m.carbsG !== undefined && <span>• C: {m.carbsG}g</span>}
                        {m.fatG !== undefined && <span>• F: {m.fatG}g</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMeal(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete meal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= 4. ACTIVITY TRACKER ================= */}
        {activeTracker === "activity" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-[#142238] dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <span>{t("activityTracker")}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === "hi"
                    ? "व्यायाम का प्रकार, समय, कदम व दूरी दर्ज करें।"
                    : "Track physical workouts, walking, and cardio with duration, steps, and distance."}
                </p>
              </div>

              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {language === "hi" ? "कुल सक्रिय समय:" : "Total Active Today:"}{" "}
                <span className="text-[#16B8A6] font-black">{totalActMins} mins</span>
              </div>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4 p-5 rounded-xl bg-slate-50 dark:bg-[#172944]/60 border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("activityType")}
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  >
                    <option value="Brisk Walking">Brisk Walking (तेज चाल)</option>
                    <option value="Running / Jogging">Running / Jogging (दौड़ना)</option>
                    <option value="Stationary Cycling">Stationary Cycling (साइकिलिंग)</option>
                    <option value="Yoga / Stretching">Yoga / Stretching (योग)</option>
                    <option value="Strength Training">Strength Training (जिम / वजन)</option>
                    <option value="Swimming">Swimming (तैराकी)</option>
                    <option value="Other Cardio">Other Cardio (अन्य व्यायाम)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("durationMins")}
                  </label>
                  <input
                    type="number"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("intensity")}
                  </label>
                  <select
                    value={actIntensity}
                    onChange={(e: any) => setActIntensity(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  >
                    <option value="low">Low (हल्की)</option>
                    <option value="medium">Medium (मध्यम)</option>
                    <option value="high">High (तीव्र)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("steps")} (Optional)
                  </label>
                  <input
                    type="number"
                    value={actSteps}
                    onChange={(e) => setActSteps(e.target.value)}
                    placeholder="e.g., 4000"
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("distanceKm")} (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={actDistance}
                    onChange={(e) => setActDistance(e.target.value)}
                    placeholder="e.g., 3.2"
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Calories Burned (kcal)
                  </label>
                  <input
                    type="number"
                    value={actCalories}
                    onChange={(e) => setActCalories(e.target.value)}
                    placeholder="e.g., 180"
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  placeholder="e.g., Morning park loop, maintained steady breathing"
                  className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#101C31] border border-slate-200 dark:border-slate-700 text-[#142238] dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{t("logActivity")}</span>
              </button>
            </form>

            {/* List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === "hi" ? "आज दर्ज व्यायाम:" : "Logged Activities for this Date:"}
              </h3>

              {activities.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-[#172944]/40 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  No activity sessions recorded for {selectedDate}.
                </div>
              ) : (
                activities.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#142238] dark:text-white">{a.activityType}</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                          {a.durationMinutes} mins
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          {a.intensity} intensity
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 mt-1 text-[11px]">
                        {a.steps && <span>{a.steps.toLocaleString()} steps</span>}
                        {a.distanceKm && <span>• {a.distanceKm} km</span>}
                        {a.caloriesBurned && <span>• {a.caloriesBurned} kcal</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteActivity(a.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= 5. MOOD JOURNAL ================= */}
        {activeTracker === "mood" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-[#142238] dark:text-white flex items-center gap-2">
                  <Smile className="w-5 h-5 text-yellow-500" />
                  <span>{t("moodJournal")}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === "hi"
                    ? "व्यक्तिगत मनोदशा और विचार दर्ज करें। यह डेटा पूरी तरह से निजी है।"
                    : "Record subjective daily mood and reflections. Always private, editable, and never diagnostic."}
                </p>
              </div>

              {mood && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Logged: {mood.mood}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveMood} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  {t("moodCategory")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  {[
                    { id: "great", label: "Great", emoji: "😄" },
                    { id: "good", label: "Good", emoji: "🙂" },
                    { id: "neutral", label: "Neutral", emoji: "😐" },
                    { id: "low", label: "Low", emoji: "😔" },
                    { id: "stressed", label: "Stressed", emoji: "😰" },
                    { id: "anxious", label: "Anxious", emoji: "😟" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id as any)}
                      className={`p-3.5 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center gap-1.5 ${
                        selectedMood === m.id
                          ? "bg-[#16B8A6] text-[#101C31] border-[#16B8A6] shadow-sm font-black scale-105"
                          : "bg-[#F5F7FB] dark:bg-[#172944] text-slate-600 dark:text-slate-300 border-[#E4EAF1] dark:border-[#1B2D48] hover:border-slate-400"
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {language === "hi" ? "दैनिक विचार या कारण (वैकल्पिक)" : "Personal Reflection / Context (Optional)"}
                </label>
                <textarea
                  rows={3}
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  placeholder={
                    language === "hi"
                      ? "आज आपका दिन कैसा रहा? क्या कोई विशेष तनाव या सकारात्मक घटना हुई?"
                      : "How did your day feel overall? Any notable energy, work stress, or positive highlights?"
                  }
                  className="w-full p-3 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#16B8A6]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-all shadow-md active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{t("saveMood")}</span>
                </button>

                <span className="text-[11px] text-slate-400">
                  {language === "hi" ? "गोपनीयता सुरक्षित • कभी नैदानिक नहीं" : "Confidential • Never used to diagnose conditions"}
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
