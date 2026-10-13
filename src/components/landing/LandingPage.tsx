import React, { useState } from "react";
import {
  FileText,
  Brain,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Clock,
  Layers,
  ChevronRight,
  HeartPulse,
  Ambulance,
  Shield,
  ShieldAlert,
  PhoneCall,
  Activity,
  UploadCloud,
  Check,
  TrendingDown,
  Pill,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ThreeHeroScene } from "../ThreeHeroScene.js";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { ViewTab } from "../../types/health.js";

interface LandingPageProps {
  onEnterApp: (tab?: ViewTab) => void;
  onOpenEmergencyModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenEmergencyModal }) => {
  const { switchProfile, register } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [previewTest, setPreviewTest] = useState<"hba1c" | "glucose" | "cholesterol">("hba1c");

  const handleStartDemo = (profileKey: "rajesh" | "priya" = "rajesh") => {
    switchProfile(profileKey);
    onEnterApp("overview");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authName.trim()) {
      await register(authName, authEmail || "patient@healthora.local");
      setAuthModalOpen(false);
      onEnterApp("overview");
    }
  };

  // Preview interactive data for the product preview section
  const previewData = {
    hba1c: [
      { date: "May 25", value: 7.8, unit: "%", ref: "4.0 - 5.6%" },
      { date: "Oct 25", value: 7.5, unit: "%", ref: "4.0 - 5.6%" },
      { date: "Jan 26", value: 7.4, unit: "%", ref: "4.0 - 5.6%" },
    ],
    glucose: [
      { date: "May 25", value: 164, unit: "mg/dL", ref: "70 - 99" },
      { date: "Oct 25", value: 148, unit: "mg/dL", ref: "70 - 99" },
      { date: "Jan 26", value: 138, unit: "mg/dL", ref: "70 - 99" },
    ],
    cholesterol: [
      { date: "May 25", value: 242, unit: "mg/dL", ref: "< 200" },
      { date: "Oct 25", value: 228, unit: "mg/dL", ref: "< 200" },
      { date: "Jan 26", value: 218, unit: "mg/dL", ref: "< 200" },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#142238] antialiased selection:bg-[#16B8A6] selection:text-white transition-colors">
      {/* 0. EMERGENCY HOTLINE BANNER: Ambulance 108 & Police 100 */}
      <aside aria-label="Emergency Helplines" className="bg-[#101C31] border-b border-[#1B2D48] text-slate-300 text-xs py-2 px-4 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold text-white tracking-wide">
              {language === "hi" ? "आपातकालीन हेल्पलाइन (24x7 निःशुल्क):" : "Emergency Helplines (24x7 Toll-Free):"}
            </span>
            <span className="text-slate-400 hidden md:inline">
              {language === "hi"
                ? "तत्काल आपातकालीन चिकित्सा या पुलिस सहायता के लिए सीधे डायल करें"
                : "Immediate direct dispatch for acute medical trauma & emergency police protection"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 font-mono font-bold text-[11px] sm:text-xs">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-colors"
              title="Call Ambulance 108"
            >
              <Ambulance className="w-3.5 h-3.5 text-rose-400" />
              <span>Ambulance: 108</span>
            </a>
            <a
              href="tel:100"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors"
              title="Call Police 100"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Police: 100</span>
            </a>
            <a
              href="tel:112"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Call Unified Helpline 112"
            >
              <span>Unified: 112</span>
            </a>
            {onOpenEmergencyModal && (
              <button
                onClick={onOpenEmergencyModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-[11px] transition-colors"
              >
                <PhoneCall className="w-3 h-3" />
                <span>All Lines & ID</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 1. SLIM ELEGANT NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#101C31]/95 backdrop-blur-md border-b border-[#1B2D48] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Logo & Medical Intelligence Symbol */}
          <a href="#" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-[#16B8A6]/10 border border-[#16B8A6]/30 flex items-center justify-center group-hover:border-[#16B8A6] transition-colors shadow-sm">
              <svg
                className="w-5 h-5 text-[#16B8A6]"
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
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white">
                HEALTHORA
              </span>
              <span className="text-[10px] tracking-wider text-[#66E3D3] font-semibold uppercase -mt-0.5">
                Clinical Intelligence
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#showcase" className="hover:text-[#66E3D3] transition-colors whitespace-nowrap">
              Product
            </a>
            <a href="#features" className="hover:text-[#66E3D3] transition-colors whitespace-nowrap">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#66E3D3] transition-colors whitespace-nowrap">
              How It Works
            </a>
            <a href="#privacy" className="hover:text-[#66E3D3] transition-colors whitespace-nowrap">
              Privacy & Security
            </a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* SOS Quick Trigger */}
            {onOpenEmergencyModal && (
              <button
                onClick={onOpenEmergencyModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors whitespace-nowrap"
                title="Immediate Ambulance & Police Contacts"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">SOS: 108 • 100</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#1B2D48] text-slate-200 hover:bg-[#233a5d] transition-colors whitespace-nowrap"
              title="Toggle English / Hindi"
            >
              {language === "en" ? "हिन्दी" : "EN"}
            </button>

            {/* Sign In / Demo */}
            <button
              onClick={() => handleStartDemo("rajesh")}
              className="hidden lg:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Sign In
            </button>

            {/* Get Started Button */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl shadow-md transition-all hover:scale-[1.02] whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. CINEMATIC 3D HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#101C31] via-[#122037] to-[#101C31] text-white pt-16 pb-24 lg:pt-20 lg:pb-32 border-b border-[#1B2D48]">
        {/* Subtle atmospheric ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#16B8A6]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow Label */}
            <div className="text-xs font-mono font-bold tracking-widest text-[#66E3D3] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16B8A6]" />
              <span>PERSONAL HEALTH INTELLIGENCE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Your Health Data. <br />
              <span className="teal-gradient-text">One Intelligent Copilot.</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Turn scattered prescriptions, laboratory reports, daily wellness habits, and health journal notes into actionable, structured intelligence.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleStartDemo("rajesh")}
                className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl shadow-lg transition-all hover:scale-[1.02] whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEnterApp("overview")}
                className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-200 bg-[#1B2D48] border border-slate-700 hover:border-slate-500 rounded-xl hover:bg-[#22395b] transition-colors whitespace-nowrap shadow-sm"
              >
                <span>Explore Healthora</span>
              </button>
            </div>

            {/* Concise Trust Message */}
            <div className="pt-3 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16B8A6] shrink-0" />
              <span>
                You remain in full control of your health data. Stored privately with Row-Level Security, never used for AI model training.
              </span>
            </div>
          </div>

          {/* Right Column: 3D Visual Composition */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full aspect-square max-w-[500px] rounded-3xl bg-gradient-to-br from-[#101C31] via-[#1B2D48] to-[#101C31] p-3 relative overflow-hidden shadow-2xl border border-[#16B8A6]/25">
              {/* Three.js 3D WebGL Canvas */}
              <ThreeHeroScene />

              {/* Floating Layer 1: Medical Lab Card */}
              <div className="absolute top-4 left-4 p-3.5 rounded-2xl bg-white/95 text-[#142238] shadow-2xl border border-white/40 text-xs backdrop-blur-md max-w-[210px] space-y-1 z-20 pointer-events-auto">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>BIOCHEMISTRY</span>
                  <span className="text-[#D9972B] font-bold">Above Target</span>
                </div>
                <div className="font-extrabold text-sm text-[#101C31]">HbA1c: 7.4%</div>
                <div className="text-[10px] text-slate-500">Ref: 4.0 - 5.6% · Prior: 7.8%</div>
              </div>

              {/* Floating Layer 2: Plain Language AI Summary Card */}
              <div className="absolute bottom-4 right-4 left-4 p-4 rounded-2xl bg-[#101C31]/95 text-white shadow-2xl border border-[#16B8A6]/30 text-xs backdrop-blur-md space-y-1.5 z-20 pointer-events-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#66E3D3]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini Multimodal Intelligence</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Bilingual EN / HI</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  "Glycemic marker improved by 0.4% compared to May 2025 report. Metformin dosage maintained."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. REFINED TRUST STRIP */}
      <section className="bg-white border-b border-[#E4EAF1] py-6 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E6F8F4] text-[#16B8A6] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#142238]">Medical Document Intelligence</div>
              <div className="text-[11px] text-[#64748B]">Accurate multimodal extraction</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E6F8F4] text-[#16B8A6] flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#142238]">Understandable AI Summaries</div>
              <div className="text-[11px] text-[#64748B]">Plain English and Hindi insights</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E6F8F4] text-[#16B8A6] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#142238]">Organized Health History</div>
              <div className="text-[11px] text-[#64748B]">Chronological provenance timeline</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E6F8F4] text-[#16B8A6] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#142238]">Privacy-Conscious Design</div>
              <div className="text-[11px] text-[#64748B]">User ownership & Row-Level Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LARGE PRODUCT PREVIEW (Framed Glass/Navy Surface) */}
      <section id="showcase" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-mono font-bold tracking-widest text-[#16B8A6] uppercase">
            PRODUCT PREVIEW
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142238] tracking-tight">
            Inside the Healthora Clinical Workspace
          </h2>
          <p className="text-sm text-[#64748B]">
            A unified dashboard designed for both patient clarity and doctor consultation efficiency.
          </p>
        </div>

        {/* High-End Product Screenshot Container */}
        <div className="rounded-3xl bg-[#101C31] p-4 sm:p-6 shadow-2xl border border-[#1B2D48] space-y-6">
          {/* Mock Window Header */}
          <div className="flex items-center justify-between border-b border-[#1B2D48] pb-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 font-mono text-[11px] text-slate-300">
                app.healthora.internal/overview
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#16B8A6]" />
              <span>Patient Vault Connected</span>
            </div>
          </div>

          {/* Interactive Preview Dashboard Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            {/* Left Column: Real Interactive Chart Preview */}
            <div className="lg:col-span-7 bg-[#172944] p-5 rounded-2xl border border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Longitudinal Laboratory Trends
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Source reference range: {previewData[previewTest][0].ref}
                  </p>
                </div>

                {/* Test selector tabs */}
                <div className="flex items-center gap-1 bg-[#101C31] p-1 rounded-xl text-[11px]">
                  <button
                    onClick={() => setPreviewTest("hba1c")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      previewTest === "hba1c" ? "bg-[#16B8A6] text-[#101C31]" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    HbA1c
                  </button>
                  <button
                    onClick={() => setPreviewTest("glucose")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      previewTest === "glucose" ? "bg-[#16B8A6] text-[#101C31]" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Fasting Glucose
                  </button>
                  <button
                    onClick={() => setPreviewTest("cholesterol")}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      previewTest === "cholesterol" ? "bg-[#16B8A6] text-[#101C31]" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Cholesterol
                  </button>
                </div>
              </div>

              {/* Recharts chart */}
              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={previewData[previewTest]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#233a5d" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#101C31", borderColor: "#1B2D48", borderRadius: 12, color: "#fff", fontSize: 11 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#16B8A6"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#66E3D3" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700 pt-3">
                <span>Verified against source document: Max Healthcare Pathology Report</span>
                <button
                  onClick={() => handleStartDemo("rajesh")}
                  className="text-[#66E3D3] font-semibold hover:underline"
                >
                  Inspect in Live Vault →
                </button>
              </div>
            </div>

            {/* Right Column: AI Summary & Health Records Mini-Feed */}
            <div className="lg:col-span-5 space-y-4">
              {/* AI Plain Language Card */}
              <div className="bg-[#172944] p-5 rounded-2xl border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-[#16B8A6]" />
                    AI Health Summary
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Source Verified
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  "Your glycemic control has improved steadily over the last 9 months. Both fasting plasma glucose (down 26 mg/dL) and HbA1c (down 0.4%) reflect positive response to lifestyle modifications and prescribed pharmacotherapy."
                </p>
                <div className="p-2.5 rounded-xl bg-[#101C31] text-[11px] text-slate-400 italic">
                  Suggested discussion point: "Ask your clinician if repeat lipid profile is needed at the 6-month interval."
                </div>
              </div>

              {/* Miniature Health Timeline */}
              <div className="bg-[#172944] p-5 rounded-2xl border border-slate-700/60 space-y-3">
                <span className="font-bold text-white text-xs block">
                  Chronological Provenance Timeline
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#101C31] text-[11px]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#16B8A6]" />
                      <span className="text-white font-medium">Comprehensive Metabolic Panel</span>
                    </div>
                    <span className="text-slate-400 font-mono">Jan 2026</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#101C31] text-[11px]">
                    <div className="flex items-center gap-2">
                      <Pill className="w-3.5 h-3.5 text-[#16B8A6]" />
                      <span className="text-white font-medium">Metformin 500mg (Adherence Logged)</span>
                    </div>
                    <span className="text-slate-400 font-mono">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action inside preview */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#1B2D48]">
            <span className="text-xs text-slate-400">
              Interactive preview using fictional demo dataset (Rajesh Sharma, 48M).
            </span>
            <button
              onClick={() => handleStartDemo("rajesh")}
              className="px-5 py-2 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-colors shadow-sm"
            >
              Open Live Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* 5. FOUR EDITORIAL FEATURE SHOWCASE SECTIONS */}
      <section id="features" className="py-20 bg-white border-y border-[#E4EAF1]">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          {/* Feature 1: Understand Your Medical Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-mono font-bold text-[#16B8A6] uppercase tracking-wider">
                FEATURE 01 · MULTIMODAL EXTRACTION
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#142238] tracking-tight">
                Understand Your Medical Reports in Plain Language
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Dense laboratory sheets and handwritten prescription notes often leave patients overwhelmed. Healthora parses scanned PDFs and photos, extracting individual parameters alongside the exact reference ranges printed on that specific laboratory report.
              </p>
              <ul className="space-y-2.5 text-xs text-[#142238] pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                  <span>Dual bilingual explanations: toggle between English and Hindi effortlessly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                  <span>Uncertainty flags: any faint or unreadable text is marked for human review.</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-6 p-6 rounded-3xl bg-[#F5F7FB] border border-[#E4EAF1] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E4EAF1]">
                <span className="font-bold text-[#101C31]">Extracted Parameter Review</span>
                <span className="text-[11px] font-mono text-[#16B8A6]">Confidence: 98.4%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#E4EAF1] text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#142238]">
                  <span>Fasting Blood Sugar</span>
                  <span className="text-[#D9972B] font-mono">138 mg/dL</span>
                </div>
                <div className="text-[11px] text-[#64748B]">Printed Reference Range: 70 – 99 mg/dL</div>
                <p className="text-[11px] text-slate-600 pt-1">
                  "Above standard reference range. Represents morning fasting glucose before dietary intake."
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2: One Connected Health Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 p-6 rounded-3xl bg-[#F5F7FB] border border-[#E4EAF1] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E4EAF1]">
                <span className="font-bold text-[#101C31]">Chronological Provenance Feed</span>
                <span className="text-[11px] text-[#64748B]">Live Vault</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#E4EAF1] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-[#16B8A6]" />
                    <span className="font-semibold text-[#142238]">Max Pathology HbA1c Report</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">14 Jan 2026</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E4EAF1] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#16B8A6]" />
                    <span className="font-semibold text-[#142238]">Metformin 500mg Prescribed</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">15 May 2025</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <div className="text-xs font-mono font-bold text-[#16B8A6] uppercase tracking-wider">
                FEATURE 02 · LONGITUDINAL CHRONOLOGY
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#142238] tracking-tight">
                One Connected Health Timeline
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Medical episodes rarely happen in isolation. Healthora links multiple laboratory tests across different hospital networks, prescription adjustments, and personal wellness observations into an organized health narrative.
              </p>
              <ul className="space-y-2.5 text-xs text-[#142238] pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                  <span>Search and filter records by diagnostic category, date range, or doctor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                  <span>Source verification links directly back to original scanned evidence.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Visualize Your Health Information */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-mono font-bold text-[#16B8A6] uppercase tracking-wider">
                FEATURE 03 · ADVANCED VISUALIZATION
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#142238] tracking-tight">
                Visualize Your Health Information Clearly
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Rather than comparing isolated numbers on scattered pieces of paper, view clean interactive line charts that plot matching tests across months with explicit source-reported upper and lower reference bounds.
              </p>
              <ul className="space-y-2.5 text-xs text-[#142238] pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                  <span>Never confuses incompatible units (e.g., mg/dL vs. mmol/L).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                  <span>Restrained palette with clear legends and zero distracting clutter.</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-6 p-6 rounded-3xl bg-[#F5F7FB] border border-[#E4EAF1] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E4EAF1]">
                <span className="font-bold text-[#101C31]">Interactive Analytics</span>
                <span className="text-[11px] text-[#16B8A6] font-semibold">Recharts Engine</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E4EAF1] space-y-2">
                <div className="text-xs font-bold text-[#142238]">Glycemic Progression (90-day tracking)</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#16B8A6]">7.4%</span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" /> 0.4% improvement
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Ref Range: 4.0 - 5.6% · Previous test: 7.8%</div>
              </div>
            </div>
          </div>

          {/* Feature 4: Your Information, Under Your Control */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 p-6 rounded-3xl bg-[#F5F7FB] border border-[#E4EAF1] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E4EAF1]">
                <span className="font-bold text-[#101C31]">Security & Governance</span>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">RLS Protected</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#E4EAF1] text-xs space-y-2">
                <div className="font-semibold text-[#142238]">Strict Data Governance Architecture</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Medical records are stored in private isolated storage buckets. Only authenticated users can access their encrypted health records.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <Lock className="w-3 h-3 text-[#16B8A6]" />
                  <span>One-click complete record erasure supported</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <div className="text-xs font-mono font-bold text-[#16B8A6] uppercase tracking-wider">
                FEATURE 04 · PRIVACY FIRST
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#142238] tracking-tight">
                Your Information, Under Your Control
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Healthora is built with strict privacy discipline. We never sell patient data, track users across the web, or utilize private medical records to train public generative AI foundation models.
              </p>
              <ul className="space-y-2.5 text-xs text-[#142238] pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                  <span>PostgreSQL Row-Level Security ensures authenticated data isolation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                  <span>Immediate document deletion purges both raw files and parsed fields.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (Sophisticated 4-step process) */}
      <section id="how-it-works" className="py-20 bg-[#F5F7FB] border-b border-[#E4EAF1]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-mono font-bold text-[#16B8A6] uppercase tracking-wider">
              WORKFLOW
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142238] tracking-tight">
              How Healthora Works in 4 Steps
            </h2>
            <p className="text-sm text-[#64748B]">
              From raw paper documents to structured clinical intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border border-[#E4EAF1] shadow-xs space-y-3 relative hover:border-[#16B8A6]/40 transition-colors">
              <div className="font-mono font-extrabold text-2xl text-[#16B8A6]">01.</div>
              <h3 className="text-base font-bold text-[#101C31]">Upload</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Drop your PDF or image (pathology report, prescription, discharge summary) into the private intake workspace.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border border-[#E4EAF1] shadow-xs space-y-3 relative hover:border-[#16B8A6]/40 transition-colors">
              <div className="font-mono font-extrabold text-2xl text-[#16B8A6]">02.</div>
              <h3 className="text-base font-bold text-[#101C31]">Extract</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Multimodal Gemini 3.8 extracts numerical values, units, reference intervals, and physician instructions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border border-[#E4EAF1] shadow-xs space-y-3 relative hover:border-[#16B8A6]/40 transition-colors">
              <div className="font-mono font-extrabold text-2xl text-[#16B8A6]">03.</div>
              <h3 className="text-base font-bold text-[#101C31]">Understand</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Read plain-language explanations in English or Hindi, with highlighted questions to discuss with your doctor.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border border-[#E4EAF1] shadow-xs space-y-3 relative hover:border-[#16B8A6]/40 transition-colors">
              <div className="font-mono font-extrabold text-2xl text-[#16B8A6]">04.</div>
              <h3 className="text-base font-bold text-[#101C31]">Organize</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Track long-term lab trends, keep daily medication reminders, and export a formatted dossier for clinical visits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL RESTRAINED NAVY CTA */}
      <section className="py-20 bg-[#101C31] text-white border-t border-[#1B2D48]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Make Your Health Information Easier to Understand.
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto">
            Take control of your medical history with AI-powered clarity, source verification, and longitudinal tracking.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-sm shadow-lg transition-all hover:scale-[1.02]"
            >
              Get Started
            </button>
            <button
              onClick={() => handleStartDemo("rajesh")}
              className="px-6 py-3.5 rounded-xl bg-[#1B2D48] hover:bg-[#233a5d] text-white font-semibold text-sm border border-slate-700 transition-colors"
            >
              Explore Demo (Rajesh Sharma, 48M)
            </button>
          </div>
        </div>
      </section>

      {/* 8. PROFESSIONAL FOOTER */}
      <footer className="py-12 bg-[#0B132B] text-slate-400 text-xs border-t border-[#1B2D48]">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider">HEALTHORA</span>
              <span>· Personal Health Intelligence Platform</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#showcase" className="hover:text-white transition-colors">Product</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#privacy" className="hover:text-white transition-colors">Privacy & Security</a>
              <button onClick={() => handleStartDemo("rajesh")} className="text-[#66E3D3] hover:underline font-semibold">
                Launch Workspace
              </button>
            </div>
          </div>

          {/* Mandatory Medical Disclaimer Notice */}
          <div className="p-4 rounded-xl bg-[#101C31] border border-[#1B2D48] text-[11px] leading-relaxed text-slate-400">
            <strong>Medical Disclaimer:</strong> HEALTHORA is an informational and organizational personal health platform. It is not a doctor, medical diagnostic device, or substitute for professional medical care, diagnosis, or treatment. Always seek the advice of your physician or qualified healthcare provider with any questions you may have regarding a medical condition.
          </div>

          <div className="text-center text-[11px] text-slate-500">
            © 2026 Healthora. Powered by Google Gemini Multimodal AI.
          </div>
        </div>
      </footer>

      {/* Profile Creation / Sign In Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#101C31]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#101C31] dark:text-white">
                  Create Your Health Profile
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Set up your encrypted vault to upload and manage records
                </p>
              </div>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#142238] dark:text-slate-300 mb-1">
                  Full Name / Preferred Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rajesh Sharma"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E4EAF1] dark:border-slate-700 bg-[#F5F7FB] dark:bg-slate-800 text-[#142238] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#16B8A6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#142238] dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g., rajesh@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E4EAF1] dark:border-slate-700 bg-[#F5F7FB] dark:bg-slate-800 text-[#142238] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#16B8A6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalOpen(false);
                    handleStartDemo("rajesh");
                  }}
                  className="text-xs text-[#16B8A6] hover:underline font-semibold"
                >
                  Or explore demo data
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl transition-colors shadow-sm"
                >
                  Create & Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
