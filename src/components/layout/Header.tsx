import React, { useState, useEffect } from "react";
import {
  Search,
  Globe,
  Sun,
  Moon,
  Bell,
  User,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Brain,
  Layers,
  Lock,
  Database,
  ShieldCheck,
  LogOut,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { useTheme } from "../../context/ThemeContext.js";
import { ViewTab } from "../../types/health.js";

interface HeaderProps {
  currentTab: ViewTab;
  onNavigateTab: (tab: ViewTab) => void;
  onOpenUploadModal: () => void;
  onOpenEmergencyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateTab,
  onOpenUploadModal,
  onOpenEmergencyModal,
}) => {
  const {
    user,
    activeProfileKey,
    switchProfile,
    resetDemo,
    login,
    register,
    logout,
    supabaseConnected,
    isPersonalAccount,
  } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"demo" | "personal" | "diagnostics">("demo");
  const [pendingRemindersCount, setPendingRemindersCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Personal Auth Form States
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Diagnostics State
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/reminders")
      .then((r) => r.json())
      .then((d) => {
        const count = (d.reminders || []).filter((r: any) => r.enabled && !r.completed).length;
        setPendingRemindersCount(count);
      })
      .catch(() => {});
  }, [activeProfileKey]);

  const loadDiagnostics = async () => {
    try {
      setDiagnosticsLoading(true);
      const res = await fetch("/api/backend-status");
      const data = await res.json();
      setDiagnosticsData(data);
    } catch (e) {
      console.warn("Diagnostics check error:", e);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authEmail.trim()) {
      setAuthError("Email address is required");
      return;
    }
    if (authMode === "register" && !authName.trim()) {
      setAuthError("Full name is required");
      return;
    }

    try {
      setAuthLoading(true);
      let result;
      if (authMode === "register") {
        result = await register(authName, authEmail, authPassword || undefined);
      } else {
        result = await login(authEmail, authPassword || undefined);
      }

      if (result.success) {
        setIsDemoModalOpen(false);
        setAuthEmail("");
        setAuthName("");
        setAuthPassword("");
      } else {
        setAuthError(result.error || "Authentication failed");
      }
    } catch (err: any) {
      setAuthError(err?.message || "Operation failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const tabLabels: Record<ViewTab, string> = {
    overview: t("navOverview"),
    tracking: t("navTracking"),
    records: t("navRecords"),
    journal: t("navJournal"),
    ai_bots: t("navAIBots"),
    analytics: t("navAnalytics"),
    reminders: t("navReminders"),
    settings: t("navSettings"),
    labs: t("navLabs"),
    medications: t("navMedications"),
    timeline: t("navTimeline"),
    summary: t("navSummary"),
    export: t("navExport"),
    privacy: t("navPrivacy"),
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3.5 bg-white/95 dark:bg-[#101C31]/95 backdrop-blur-md border-b border-[#E4EAF1] dark:border-[#1B2D48] transition-colors">
      {/* Zone 1: Contextual Breadcrumb & View Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-slate-400 whitespace-nowrap">
          <span className="font-extrabold text-[#142238] dark:text-white tracking-tight">
            HEALTHORA 2.0
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
            /
          </span>
          <span className="text-[#16B8A6] font-bold">{tabLabels[currentTab] || "Workspace"}</span>
        </div>
      </div>

      {/* Zone 2: Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === "hi"
                ? "दस्तावेज़, परीक्षण, वेलनेस लॉग या दवा खोजें..."
                : "Search medical records, labs, wellness logs, journal..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                onNavigateTab("records");
              }
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] rounded-xl text-[#142238] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#16B8A6] transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Persistent AI Assistant Launcher */}
        <button
          onClick={() => onNavigateTab("ai_bots")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap shadow-xs ${
            currentTab === "ai_bots"
              ? "bg-[#16B8A6] text-[#101C31] border-[#16B8A6]"
              : "bg-[#E6F8F4] dark:bg-[#172944] text-[#16B8A6] dark:text-[#66E3D3] border-[#16B8A6]/40 hover:bg-[#d5f3ec]"
          }`}
          title="Open AI Bots Assistant"
        >
          <Brain className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Bots</span>
        </button>

        {/* Reminders / Notifications Bell */}
        <button
          onClick={() => onNavigateTab("reminders")}
          className="relative p-2 rounded-lg bg-[#F5F7FB] dark:bg-[#172944] text-slate-600 dark:text-slate-300 border border-[#E4EAF1] dark:border-[#1B2D48] hover:bg-slate-200 transition-colors"
          title={`${pendingRemindersCount} pending reminders`}
        >
          <Bell className="w-4 h-4" />
          {pendingRemindersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
              {pendingRemindersCount}
            </span>
          )}
        </button>

        {/* Emergency SOS Button (Ambulance 108 & Police 100) */}
        {onOpenEmergencyModal && (
          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 transition-colors whitespace-nowrap shadow-xs"
            title="Emergency SOS: Immediate Ambulance (108) & Police (100)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>SOS: 108 • 100</span>
          </button>
        )}

        {/* Patient / Profile Switcher Button */}
        <button
          onClick={() => {
            setIsDemoModalOpen(true);
            loadDiagnostics();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
            isPersonalAccount
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
              : "bg-[#E6F8F4] dark:bg-[#1B2D48] text-[#16B8A6] dark:text-[#66E3D3] border-[#16B8A6]/30 dark:border-[#1B2D48] hover:bg-[#d5f3ec]"
          }`}
          title="Account switcher & Supabase database diagnostics"
        >
          {isPersonalAccount ? (
            <User className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#16B8A6]" />
          )}
          <span className="hidden sm:inline font-bold">{user?.name || "Patient Profile"}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
            {activeProfileKey === "rajesh"
              ? "Type 2 DM"
              : activeProfileKey === "priya"
              ? "Wellness"
              : "Personal"}
          </span>
        </button>

        {/* Language Selector (EN / HI) */}
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#F5F7FB] dark:bg-[#172944] text-slate-700 dark:text-slate-200 border border-[#E4EAF1] dark:border-[#1B2D48] hover:bg-slate-200 dark:hover:bg-[#233a5d] transition-colors whitespace-nowrap"
          title="Switch language between English and Hindi"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === "en" ? "हिन्दी" : "EN"}</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-[#F5F7FB] dark:bg-[#172944] text-slate-700 dark:text-slate-200 border border-[#E4EAF1] dark:border-[#1B2D48] hover:bg-slate-200 dark:hover:bg-[#233a5d] transition-colors"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Account & Profile Switcher Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#101C31] w-full max-w-lg rounded-2xl border border-[#E4EAF1] dark:border-[#1B2D48] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#16B8A6]" />
                <div>
                  <h3 className="font-extrabold text-sm text-[#142238] dark:text-white">
                    Account & Database Workspace
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Switch demo profiles, manage personal account, or view Supabase status
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#172944]/50 px-5 pt-2">
              <button
                onClick={() => setModalTab("demo")}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === "demo"
                    ? "border-[#16B8A6] text-[#16B8A6]"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Profiles</span>
              </button>
              <button
                onClick={() => setModalTab("personal")}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === "personal"
                    ? "border-[#16B8A6] text-[#16B8A6]"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Personal Account</span>
                {isPersonalAccount && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </button>
              <button
                onClick={() => {
                  setModalTab("diagnostics");
                  loadDiagnostics();
                }}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === "diagnostics"
                    ? "border-[#16B8A6] text-[#16B8A6]"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Cloud & RLS</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* TAB 1: DEMO PROFILES */}
              {modalTab === "demo" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Test full clinical intelligence with pre-loaded realistic medical scenarios:
                  </p>

                  <button
                    onClick={() => {
                      switchProfile("rajesh");
                      setIsDemoModalOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      activeProfileKey === "rajesh"
                        ? "bg-[#16B8A6]/10 border-[#16B8A6] text-[#16B8A6]"
                        : "bg-slate-50 dark:bg-[#172944] border-slate-200 dark:border-slate-800 hover:border-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#142238] dark:text-white flex items-center gap-1.5">
                        <span>Rajesh Sharma (47, Male)</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                          Type 2 DM
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Dyslipidemia, Metformin & Atorvastatin • 7-day sleep & water logs, journal entries, abnormal lab trajectory
                      </div>
                    </div>
                    {activeProfileKey === "rajesh" && (
                      <CheckCircle2 className="w-5 h-5 text-[#16B8A6] shrink-0 ml-2" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      switchProfile("priya");
                      setIsDemoModalOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      activeProfileKey === "priya"
                        ? "bg-[#16B8A6]/10 border-[#16B8A6] text-[#16B8A6]"
                        : "bg-slate-50 dark:bg-[#172944] border-slate-200 dark:border-slate-800 hover:border-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#142238] dark:text-white flex items-center gap-1.5">
                        <span>Priya Patel (34, Female)</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold">
                          Wellness & Thyroid
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Subclinical Thyroiditis, Levothyroxine • High-hydration tracking, pilates logs, energy symptoms
                      </div>
                    </div>
                    {activeProfileKey === "priya" && (
                      <CheckCircle2 className="w-5 h-5 text-[#16B8A6] shrink-0 ml-2" />
                    )}
                  </button>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        resetDemo();
                        setIsDemoModalOpen(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Demo Seed Records</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PERSONAL ACCOUNT */}
              {modalTab === "personal" && (
                <div className="space-y-4">
                  {isPersonalAccount ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                            Signed in as {user?.name}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                            {user?.email}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                          Active Vault
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Your medical records, daily trackers, and journal logs in this account are 100% private and isolated with Row Level Security.
                      </p>

                      <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                        <button
                          onClick={() => {
                            logout();
                            setIsDemoModalOpen(false);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out to Demo Mode</span>
                        </button>
                        <button
                          onClick={() => setIsDemoModalOpen(false)}
                          className="px-3 py-1.5 rounded-lg bg-[#16B8A6] text-[#101C31] text-xs font-bold"
                        >
                          Keep Working
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {authMode === "register" ? "Create Personal Health Vault" : "Sign In to Personal Vault"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode(authMode === "register" ? "login" : "register");
                            setAuthError(null);
                          }}
                          className="text-xs text-[#16B8A6] font-bold hover:underline"
                        >
                          {authMode === "register" ? "Already have account? Sign In" : "Need an account? Register"}
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                        Personal accounts start with a completely empty, private health vault. No mock data is copied or mixed.
                      </p>

                      {authError && (
                        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5 mb-3">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <form onSubmit={handleAuthSubmit} className="space-y-3">
                        {authMode === "register" && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              placeholder="e.g. Dr. Sri Prasad"
                              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#172944] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#16B8A6]"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="patient@healthora.org"
                            required
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#172944] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#16B8A6]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Password {supabaseConnected ? "(Supabase Auth)" : "(Optional)"}
                          </label>
                          <input
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#172944] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#16B8A6]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#139a8b] text-[#101C31] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-2"
                        >
                          {authLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {authMode === "register" ? "Create Account & Start Fresh" : "Sign In to My Account"}
                          </span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DIAGNOSTICS & SUPABASE CONFIG */}
              {modalTab === "diagnostics" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#172944] border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          PostgreSQL & Row Level Security
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          diagnosticsData?.supabase?.connected
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {diagnosticsData?.supabase?.connected
                          ? "Supabase Connected"
                          : "Local Encrypted Store Active"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {diagnosticsData?.supabase?.message ||
                        "Healthora uses an encrypted persistent database with full schema enforcement when remote Supabase credentials are not in .env."}
                    </p>

                    <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 space-y-1">
                      <div>RLS Isolation Policy: <span className="text-emerald-500">auth.uid() = user_id</span></div>
                      <div>Service Key Safety: <span className="text-emerald-500">Strictly Server-Only</span></div>
                      <div>Vite Public Anon: <span className="text-blue-400">Safe Client-Ready</span></div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Supabase Integration Instructions</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      To connect your remote Supabase project:
                      <br />
                      1. Copy your Project URL & Anon Key into <code className="font-mono font-bold">.env</code> (<code className="font-mono">SUPABASE_URL</code>, <code className="font-mono">SUPABASE_ANON_KEY</code>).
                      <br />
                      2. Run the SQL migrations in <code className="font-mono">/supabase/migrations/</code> in your Supabase SQL Editor.
                    </p>
                  </div>

                  <button
                    onClick={loadDiagnostics}
                    disabled={diagnosticsLoading}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsLoading ? "animate-spin" : ""}`} />
                    <span>Re-test Connectivity</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50/70 dark:bg-[#172944]/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs px-5">
              <span className="text-[11px] text-slate-400">
                Active: <strong className="text-slate-700 dark:text-slate-200">{user?.name || "Patient"}</strong>
              </span>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#16B8A6] text-[#101C31] text-xs font-bold hover:bg-[#139a8b]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
