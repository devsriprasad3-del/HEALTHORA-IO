import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  Info,
  Droplets,
  Moon,
  Activity,
  Utensils,
  FileText,
  AlertCircle,
  Pill,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { ReminderItem, ViewTab } from "../../types/health.js";

interface RemindersViewProps {
  onNavigateTab: (tab: ViewTab) => void;
  onLaunchAIBotWithContext?: (pageContext: string, initialPrompt?: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  onNavigateTab,
  onLaunchAIBotWithContext,
}) => {
  const { user, activeProfileKey } = useAuth();
  const { t, language } = useLanguage();

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [toast, setToast] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ReminderItem["category"]>("water");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("08:00");
  const [recurrence, setRecurrence] = useState<ReminderItem["recurrence"]>("daily");

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reminders");
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch (err) {
      console.error("Failed to load reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [activeProfileKey]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Browser Notification Request
  const requestNotificationAccess = async () => {
    if (typeof Notification === "undefined") {
      showToast("Browser notifications are not supported in this runtime environment.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        showToast("Browser notification permission granted!");
        new Notification("HEALTHORA Reminders", {
          body: "Healthora reminders are now enabled in your browser window.",
          icon: "/favicon.ico",
        });
      } else {
        showToast("Browser notification permission was not granted.");
      }
    } catch (e) {
      showToast("Notification request could not be completed.");
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("water");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("09:00");
    setRecurrence("daily");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rem: ReminderItem) => {
    setEditingId(rem.id);
    setTitle(rem.title);
    setDescription(rem.description);
    setCategory(rem.category);
    setDate(rem.date);
    setTime(rem.time);
    setRecurrence(rem.recurrence);
    setIsModalOpen(true);
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) {
      showToast("Title, date, and time are required");
      return;
    }

    const payload = { title, description, category, date, time, recurrence };

    try {
      if (editingId) {
        const res = await fetch(`/api/reminders/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setReminders(reminders.map((r) => (r.id === editingId ? data.reminder : r)));
          showToast("Reminder updated");
        }
      } else {
        const res = await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setReminders([data.reminder, ...reminders]);
          showToast("Reminder created");
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast("Failed to save reminder");
    }
  };

  const handleToggleEnable = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}/toggle`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setReminders(reminders.map((r) => (r.id === id ? data.reminder : r)));
      }
    } catch (err) {
      showToast("Failed to toggle reminder");
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setReminders(reminders.map((r) => (r.id === id ? data.reminder : r)));
        showToast(data.reminder.completed ? "Marked as complete" : "Reopened reminder");
      }
    } catch (err) {
      showToast("Failed to update status");
    }
  };

  const handleSnooze = async (id: string, mins: number) => {
    try {
      const res = await fetch(`/api/reminders/${id}/snooze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: mins }),
      });
      const data = await res.json();
      if (data.success) {
        setReminders(reminders.map((r) => (r.id === id ? data.reminder : r)));
        showToast(`Snoozed for ${mins} minutes`);
      }
    } catch (err) {
      showToast("Failed to snooze reminder");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      setReminders(reminders.filter((r) => r.id !== id));
      showToast("Reminder deleted");
    } catch (err) {
      showToast("Failed to delete reminder");
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "water":
        return <Droplets className="w-4 h-4 text-[#16B8A6]" />;
      case "sleep":
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case "activity":
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case "meal":
        return <Utensils className="w-4 h-4 text-orange-500" />;
      case "journal":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "medication":
        return <Pill className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredReminders = reminders.filter((r) => {
    if (filterCategory === "all") return true;
    if (filterCategory === "completed") return r.completed;
    if (filterCategory === "pending") return !r.completed;
    return r.category === filterCategory;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-[#101C31] text-[#66E3D3] border border-[#16B8A6] text-xs font-bold shadow-xl">
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white dark:bg-[#101C31] p-6 rounded-2xl border border-[#E4EAF1] dark:border-[#1B2D48] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500">
              <Bell className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#142238] dark:text-white">
              {t("navReminders")}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("remindersSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {notificationPermission !== "granted" ? (
            <button
              onClick={requestNotificationAccess}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#172944] text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t("enableNotifications")}</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t("notificationsEnabled")}</span>
            </span>
          )}

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t("createReminder")}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "All Reminders" },
          { id: "pending", label: "Pending" },
          { id: "completed", label: "Completed" },
          { id: "medication", label: "Medication" },
          { id: "water", label: "Water" },
          { id: "activity", label: "Activity" },
          { id: "appointment", label: "Appointments" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterCategory === tab.id
                ? "bg-[#16B8A6] text-[#101C31]"
                : "bg-white dark:bg-[#101C31] text-slate-600 dark:text-slate-400 border border-[#E4EAF1] dark:border-[#1B2D48] hover:bg-slate-50 dark:hover:bg-[#172944]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] text-xs text-slate-400">
            No reminders found in this category. Click "+ Create Reminder" to schedule a daily habit or clinic appointment.
          </div>
        ) : (
          filteredReminders.map((rem) => {
            return (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  rem.completed
                    ? "bg-slate-50 dark:bg-[#0D1628] border-slate-200 dark:border-slate-800 opacity-60"
                    : "bg-white dark:bg-[#101C31] border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs hover:border-[#16B8A6]/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(rem.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      rem.completed
                        ? "bg-[#16B8A6] border-[#16B8A6] text-[#101C31]"
                        : "border-slate-300 dark:border-slate-600 hover:border-[#16B8A6]"
                    }`}
                  >
                    {rem.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#142238] dark:text-white">
                        {rem.title}
                      </span>
                      <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800" title={rem.category}>
                        {getCategoryIcon(rem.category)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {rem.recurrence}
                      </span>
                    </div>

                    {rem.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {rem.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-1 text-[#16B8A6] font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {rem.time}
                      </span>
                      <span>• {rem.date}</span>
                      {rem.snoozedUntil && (
                        <span className="text-amber-500 font-bold">
                          Snoozed until {new Date(rem.snoozedUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {!rem.completed && (
                    <button
                      onClick={() => handleSnooze(rem.id, 15)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#172944] dark:hover:bg-[#1B2D48] text-slate-700 dark:text-slate-200 transition-colors"
                      title="Snooze for 15 minutes"
                    >
                      {t("snoozeReminder")}
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(rem)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#101C31] w-full max-w-lg rounded-2xl border border-[#E4EAF1] dark:border-[#1B2D48] shadow-2xl p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-[#142238] dark:text-white mb-4">
              {editingId ? "Edit Reminder" : t("createReminder")}
            </h2>

            <form onSubmit={handleSaveReminder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t("reminderTitle")}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Afternoon Hydration or Evening Metformin"
                  required
                  className="w-full p-2.5 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Take 1 tablet with full glass of water after dinner"
                  className="w-full p-2.5 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("category")}
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                  >
                    <option value="water">Water Tracking</option>
                    <option value="medication">Medication Dosing</option>
                    <option value="sleep">Sleep Routine</option>
                    <option value="activity">Activity Logging</option>
                    <option value="meal">Meal Logging</option>
                    <option value="journal">Journal Entry</option>
                    <option value="appointment">Medical Appointment</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("recurrence")}
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e: any) => setRecurrence(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                  >
                    <option value="once">Once (एक बार)</option>
                    <option value="daily">Daily (दैनिक)</option>
                    <option value="weekdays">Weekdays (सोम-शुक्र)</option>
                    <option value="weekly">Weekly (साप्ताहिक)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full p-2.5 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("time")}
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full p-2.5 text-xs rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] text-[#142238] dark:text-white focus:outline-none"
                  />
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
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
