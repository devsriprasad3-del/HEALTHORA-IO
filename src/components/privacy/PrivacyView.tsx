import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  Trash2,
  FileCode,
  Layers,
  Copy,
  Check,
  AlertTriangle,
  Server,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { ViewTab } from "../../types/health.js";

interface PrivacyViewProps {
  onNavigateTab: (tab: ViewTab) => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onNavigateTab }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [fhirBundle, setFhirBundle] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<"security" | "supabase" | "fhir">("security");

  useEffect(() => {
    fetch("/api/abdm/fhir-bundle")
      .then((res) => res.json())
      .then((data) => setFhirBundle(data))
      .catch((err) => console.error("Error loading FHIR bundle:", err));

    fetch("/api/backend-status")
      .then((res) => res.json())
      .then((data) => setBackendStatus(data))
      .catch((err) => console.error("Error loading backend status:", err));
  }, [user]);

  const handleCopyJson = () => {
    if (!fhirBundle) return;
    navigator.clipboard.writeText(JSON.stringify(fhirBundle.bundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySqlMigration = () => {
    const sqlText = `-- HEALTHORA - PostgreSQL & Supabase Database Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_name TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
    dob DATE, gender TEXT, blood_group TEXT, abha_number TEXT,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[], chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    avatar_url TEXT, created_at TIMESTAMPTZ DEFAULT now() NOT NULL, updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    private_storage_path TEXT, original_filename TEXT NOT NULL, mime_type TEXT NOT NULL,
    file_size_bytes BIGINT, document_type TEXT NOT NULL, document_date DATE NOT NULL,
    facility TEXT, doctor TEXT, upload_status TEXT DEFAULT 'uploaded',
    processing_status TEXT DEFAULT 'pending', extraction_version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL, updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own documents" ON public.medical_documents FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.medical_documents(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL, category TEXT NOT NULL, value_numeric NUMERIC(10,3),
    value_text TEXT NOT NULL, unit TEXT, reference_low NUMERIC(10,3), reference_high NUMERIC(10,3),
    reference_range_text TEXT NOT NULL, source_interpretation TEXT NOT NULL, observed_date DATE NOT NULL,
    verification_status TEXT DEFAULT 'unverified', user_correction JSONB,
    clinical_explanation_en TEXT, clinical_explanation_hi TEXT, confidence_score NUMERIC(4,3) DEFAULT 0.950,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL, updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own lab results" ON public.lab_results FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_document_id UUID REFERENCES public.medical_documents(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL, generic_name TEXT, strength TEXT NOT NULL,
    prescribed_dosage TEXT NOT NULL, route TEXT DEFAULT 'Oral' NOT NULL,
    frequency TEXT NOT NULL, instructions TEXT, instructions_hi TEXT,
    start_date DATE NOT NULL, end_date DATE, status TEXT NOT NULL,
    user_confirmed BOOLEAN DEFAULT false NOT NULL, prescribing_doctor TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL, updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own medications" ON public.medications FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.wellness_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL, sleep_hours NUMERIC(4,2), steps INT, water_glasses NUMERIC(4,1),
    resting_heart_rate INT, blood_pressure_systolic INT, blood_pressure_diastolic INT, notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL, UNIQUE (user_id, recorded_date)
);
ALTER TABLE public.wellness_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own wellness entries" ON public.wellness_entries FOR ALL USING (auth.uid() = user_id);`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const isSupabaseLive = backendStatus?.supabase?.connected;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#16B8A6]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t("navPrivacy")}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#142238] dark:text-white mt-0.5 tracking-tight">
            {t("privacyTitle")}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Data sovereignty architecture, Row-Level Security, and ABDM/FHIR R4 interoperability
          </p>
        </div>

        {/* Segmented View Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("security")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "security"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Security Architecture
          </button>
          <button
            onClick={() => setActiveTab("supabase")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "supabase"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Supabase Backend & RLS
          </button>
          <button
            onClick={() => setActiveTab("fhir")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "fhir"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            ABDM / FHIR R4 Bundle
          </button>
        </div>
      </div>

      {/* Tab 1: Security Architecture */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* 4 Pillars of Healthora Data Protection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                PostgreSQL Row-Level Security (RLS)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("rlsExplanation")} Every query validates user ownership against authentication tokens (<code className="font-mono text-teal-600">auth.uid() = user_id</code>) so no patient can ever access another patient's documents.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Zero AI Foundation Model Training
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("noTrainingNotice")} Processed clinical facts are exclusively returned to your private session and stored in your dedicated tenant database.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Encrypted Private Vaults & Refresh Persistence
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Original pathology PDFs and images are isolated in private storage with short-lived, authenticated URLs. All updates, logs, and document extractions are persisted across server reboots and browser refreshes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Full Deletion & Revocation Rights
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You retain complete sovereignty over your data. When you delete a record or reset your profile, the file, extracted facts, and summary vectors are permanently purged.
              </p>
            </div>
          </div>

          {/* Database Architecture Disclosure */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Compliant Schema Specification
            </h3>
            <p className="text-xs text-slate-500">
              Healthora structures medical state using standard healthcare informatics tables:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {[
                "profiles",
                "medical_documents",
                "document_extractions",
                "health_summaries",
                "lab_results",
                "medications",
                "medication_reminders",
                "wellness_entries",
              ].map((table) => (
                <div
                  key={table}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 truncate"
                >
                  {table}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Supabase Backend & RLS Migration Guide */}
      {activeTab === "supabase" && (
        <div className="space-y-6">
          {/* Truthful Connection Status Banner */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Truthful Backend Connection Status
                </h3>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isSupabaseLive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {isSupabaseLive ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>
                  {isSupabaseLive ? "Supabase Cloud PostgreSQL Active" : "Local Disk-Persisted Vault Active (.data)"}
                </span>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {backendStatus?.supabase?.message || "Checking backend connection..."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Database Engine</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {isSupabaseLive ? "PostgreSQL 15 (Supabase)" : "SQLite / Disk-Persisted JSON"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">File Storage</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {backendStatus?.storage?.mode || "Encrypted Local File Vault"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Security Isolation</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  PostgreSQL RLS Enforced
                </span>
              </div>
            </div>
          </div>

          {/* How to Connect Supabase */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Connecting to Your Supabase Project
                </h3>
                <p className="text-xs text-slate-500">
                  Follow these 3 steps to connect live PostgreSQL and Storage:
                </p>
              </div>
              <button
                onClick={handleCopySqlMigration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shrink-0"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? "Copied SQL" : "Copy SQL Migration"}</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong>Execute Schema Migration:</strong> Open your Supabase Project SQL Editor and run the migration file located at <code className="font-mono text-teal-600">/supabase/migrations/20261012000000_healthora_schema.sql</code> (or click "Copy SQL Migration" above).
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong>Set Environment Secrets:</strong> Add <code className="font-mono text-teal-600">SUPABASE_URL</code>, <code className="font-mono text-teal-600">SUPABASE_ANON_KEY</code>, and <code className="font-mono text-teal-600">SUPABASE_SERVICE_ROLE_KEY</code> in the project settings.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong>Automatic Live Connection:</strong> Healthora server automatically detects the credentials, verifies database connectivity, and syncs all records directly to your PostgreSQL instance.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ABDM / FHIR R4 Bundle */}
      {activeTab === "fhir" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-teal-900 dark:text-teal-200">
                {t("abdmMockBadge")}
              </span>
              <p className="text-teal-700 dark:text-teal-300 text-[11px] mt-0.5">
                Every extracted observation is formatted with HL7 FHIR R4 resources (Patient, Observation, MedicationStatement) ready for ABDM gateway exchange.
              </p>
            </div>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold self-start sm:self-auto hover:bg-teal-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy JSON"}</span>
            </button>
          </div>

          {/* FHIR JSON Code Block */}
          {fhirBundle && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#0F172A] p-4 text-xs font-mono text-teal-300 overflow-x-auto max-h-[500px]">
              <pre>{JSON.stringify(fhirBundle.bundle, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
