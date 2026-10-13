import React, { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  FileText,
  Brain,
  TrendingUp,
  Bell,
  Settings,
  FlaskConical,
  Pill,
  Clock,
  FileDown,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Home,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { ViewTab } from "../../types/health.js";

interface SidebarProps {
  currentTab: ViewTab;
  onNavigateTab: (tab: ViewTab) => void;
  onOpenUploadModal: () => void;
  onOpenEmergencyModal?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onShowLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigateTab,
  onOpenUploadModal,
  onOpenEmergencyModal,
  isCollapsed,
  onToggleCollapse,
  onShowLanding,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [showClinicalSubmenu, setShowClinicalSubmenu] = useState<boolean>(true);

  // 8 Primary Navigation Items requested by Healthora 2.0
  const primaryNavItems: { tab: ViewTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { tab: "overview", label: t("navOverview"), icon: LayoutDashboard },
    { tab: "tracking", label: t("navTracking"), icon: Activity },
    { tab: "records", label: t("navRecords"), icon: FileText },
    { tab: "journal", label: t("navJournal"), icon: FileText },
    { tab: "ai_bots", label: t("navAIBots"), icon: Brain, badge: "Gemini" },
    { tab: "analytics", label: t("navAnalytics"), icon: TrendingUp },
    { tab: "reminders", label: t("navReminders"), icon: Bell },
    { tab: "settings", label: t("navSettings"), icon: Settings },
  ];

  // Secondary Clinical Tools (Labs, Medications, Timeline, Export Dossier, Privacy)
  const clinicalNavItems: { tab: ViewTab; label: string; icon: React.ElementType }[] = [
    { tab: "labs", label: t("navLabs"), icon: FlaskConical },
    { tab: "medications", label: t("navMedications"), icon: Pill },
    { tab: "timeline", label: t("navTimeline"), icon: Clock },
    { tab: "export", label: t("navExport"), icon: FileDown },
    { tab: "privacy", label: t("navPrivacy"), icon: ShieldCheck },
  ];

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#101C31] text-slate-300 border-r border-[#1B2D48] transition-all duration-200 z-40 select-none ${
        isCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#1B2D48]">
        <button
          onClick={onShowLanding}
          className="flex items-center gap-2.5 overflow-hidden text-left focus:outline-none group"
          title="Back to Landing Page"
        >
          {/* Medical Intelligence Glyph */}
          <div className="w-8 h-8 rounded-xl bg-[#16B8A6]/10 border border-[#16B8A6]/30 flex items-center justify-center shrink-0 group-hover:border-[#16B8A6] transition-colors">
            <svg
              className="w-4 h-4 text-[#16B8A6]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" opacity="0.3" />
              <path d="M12 6v12M6 12h12" />
              <circle cx="12" cy="12" r="3" fill="#16B8A6" stroke="none" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-extrabold tracking-tight text-white text-base block whitespace-nowrap">
                HEALTHORA <span className="text-[10px] text-[#66E3D3] font-mono">2.0</span>
              </span>
              <span className="text-[10px] text-[#66E3D3] block tracking-wider uppercase font-semibold">
                AI Wellness Platform
              </span>
            </div>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-[#1B2D48] transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Upload Action */}
      <div className="p-3">
        <button
          onClick={onOpenUploadModal}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-all shadow-md whitespace-nowrap ${
            isCollapsed ? "px-0" : ""
          }`}
          title={t("uploadReport")}
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{t("uploadReport")}</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-1 space-y-1 overflow-y-auto">
        {/* 1. Primary Healthora 2.0 Items */}
        <div className="space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onNavigateTab(item.tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap text-left ${
                  isActive
                    ? "bg-[#16B8A6]/15 text-[#66E3D3] border border-[#16B8A6]/30 shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#1B2D48]/60"
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#16B8A6]" : "text-slate-400"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#16B8A6]/20 text-[#66E3D3] border border-[#16B8A6]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Clinical Tools Divider & Submenu */}
        {!isCollapsed && (
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Clinical Workspace
            </span>
          </div>
        )}

        <div className="space-y-0.5 pt-1">
          {clinicalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onNavigateTab(item.tab)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap text-left ${
                  isActive
                    ? "bg-[#16B8A6]/15 text-[#66E3D3] border border-[#16B8A6]/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-[#1B2D48]/40"
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-[#16B8A6]" : "text-slate-500"
                  }`}
                />
                {!isCollapsed && <span className="truncate text-[11px]">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Emergency SOS Button (Ambulance 108 & Police 100) */}
      {onOpenEmergencyModal && (
        <div className="px-2.5 py-1">
          <button
            onClick={onOpenEmergencyModal}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-colors shadow-sm whitespace-nowrap ${
              isCollapsed ? "px-0" : ""
            }`}
            title="Emergency SOS: Immediate Ambulance (108) & Police (100)"
          >
            <PhoneCall className="w-4 h-4 shrink-0 animate-pulse text-white" />
            {!isCollapsed && <span>SOS: 108 • 100</span>}
          </button>
        </div>
      )}

      {/* Footer Profile & Landing Link */}
      <div className="p-3 border-t border-[#1B2D48] space-y-2">
        <button
          onClick={onShowLanding}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1B2D48] text-xs transition-colors text-left"
          title="Return to Public Landing Page"
        >
          <Home className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Home / Landing</span>}
        </button>

        {!isCollapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-[#172944] border border-[#1B2D48] text-xs">
            <div className="font-semibold text-white truncate">{user.name}</div>
            <div className="text-[11px] text-slate-400 truncate">
              {user.abhaNumber ? `ABHA: ${user.abhaNumber}` : user.email}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
