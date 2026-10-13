-- HEALTHORA - Supabase PostgreSQL Database Schema & RLS Policies Migration
-- Version: 20261012000000
-- Compliant with: HIPAA Security Rule principles, ABDM Health Data Management Policy, and HL7 FHIR R4 concepts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Mirrors auth.users with user clinical preferences)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_name TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
    dob DATE,
    gender TEXT,
    blood_group TEXT,
    abha_number TEXT,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. MEDICAL DOCUMENTS TABLE (Private storage references & metadata)
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    private_storage_path TEXT,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    document_type TEXT NOT NULL CHECK (document_type IN ('Lab Report', 'Prescription', 'Discharge Summary', 'Imaging Report', 'Other')),
    document_date DATE NOT NULL,
    facility TEXT,
    doctor TEXT,
    upload_status TEXT DEFAULT 'uploaded' CHECK (upload_status IN ('uploaded', 'failed', 'deleted')),
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'analyzed', 'verified')),
    extraction_version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_medical_docs_user_date ON public.medical_documents(user_id, document_date DESC);
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
    ON public.medical_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
    ON public.medical_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
    ON public.medical_documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON public.medical_documents FOR DELETE
    USING (auth.uid() = user_id);

-- 3. DOCUMENT EXTRACTIONS TABLE (Audit log of raw Gemini extractions and corrections)
CREATE TABLE IF NOT EXISTS public.document_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.medical_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    extracted_json JSONB NOT NULL,
    model_version TEXT DEFAULT 'gemini-3.8-flash' NOT NULL,
    review_status TEXT DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed', 'verified', 'corrected')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own document extractions"
    ON public.document_extractions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own document extractions"
    ON public.document_extractions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document extractions"
    ON public.document_extractions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. HEALTH SUMMARIES TABLE (Bilingual plain-language clinical explanations)
CREATE TABLE IF NOT EXISTS public.health_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.medical_documents(id) ON DELETE CASCADE,
    language TEXT NOT NULL CHECK (language IN ('en', 'hi')),
    summary_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.health_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health summaries"
    ON public.health_summaries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health summaries"
    ON public.health_summaries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. LAB RESULTS TABLE (Granular Observation records with source reference ranges)
CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.medical_documents(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Lipid Panel', 'Metabolic / Glucose', 'Hematology', 'Renal / Kidney', 'Thyroid', 'Liver', 'Vitamins', 'Other')),
    value_numeric NUMERIC(10,3),
    value_text TEXT NOT NULL,
    unit TEXT,
    reference_low NUMERIC(10,3),
    reference_high NUMERIC(10,3),
    reference_range_text TEXT NOT NULL,
    source_interpretation TEXT NOT NULL CHECK (source_interpretation IN ('Within Normal Range', 'Above Reference Range', 'Below Reference Range', 'Requires Review')),
    observed_date DATE NOT NULL,
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'corrected')),
    user_correction JSONB,
    clinical_explanation_en TEXT,
    clinical_explanation_hi TEXT,
    confidence_score NUMERIC(4,3) DEFAULT 0.950,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lab_results_user_test ON public.lab_results(user_id, test_name, observed_date ASC);
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lab results"
    ON public.lab_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab results"
    ON public.lab_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab results"
    ON public.lab_results FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab results"
    ON public.lab_results FOR DELETE
    USING (auth.uid() = user_id);

-- 6. MEDICATIONS TABLE (Active, extracted, and historical therapies)
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_document_id UUID REFERENCES public.medical_documents(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL,
    generic_name TEXT,
    strength TEXT NOT NULL,
    prescribed_dosage TEXT NOT NULL,
    route TEXT DEFAULT 'Oral' NOT NULL,
    frequency TEXT NOT NULL,
    instructions TEXT,
    instructions_hi TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Extracted', 'Discontinued', 'Completed')),
    user_confirmed BOOLEAN DEFAULT false NOT NULL,
    prescribing_doctor TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medications"
    ON public.medications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
    ON public.medications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
    ON public.medications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
    ON public.medications FOR DELETE
    USING (auth.uid() = user_id);

-- 7. MEDICATION REMINDERS TABLE (Dose schedules and local time adherence)
CREATE TABLE IF NOT EXISTS public.medication_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    scheduled_time TIME NOT NULL,
    days_of_week TEXT[] DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun']::TEXT[],
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    enabled BOOLEAN DEFAULT true NOT NULL,
    last_recorded_action JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medication reminders"
    ON public.medication_reminders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication reminders"
    ON public.medication_reminders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication reminders"
    ON public.medication_reminders FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. WELLNESS ENTRIES TABLE (Daily sleep, steps, water, and vitals)
CREATE TABLE IF NOT EXISTS public.wellness_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    sleep_hours NUMERIC(4,2),
    steps INT,
    water_glasses NUMERIC(4,1),
    resting_heart_rate INT,
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, recorded_date)
);

ALTER TABLE public.wellness_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wellness entries"
    ON public.wellness_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness entries"
    ON public.wellness_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness entries"
    ON public.wellness_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness entries"
    ON public.wellness_entries FOR DELETE
    USING (auth.uid() = user_id);

-- 9. HEALTH TIMELINE EVENTS TABLE (Unified chronological provenance feed)
CREATE TABLE IF NOT EXISTS public.health_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('document', 'lab', 'medication', 'wellness', 'clinical_note')),
    source_document_id UUID REFERENCES public.medical_documents(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    summary_hi TEXT,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.health_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timeline events"
    ON public.health_timeline_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timeline events"
    ON public.health_timeline_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timeline events"
    ON public.health_timeline_events FOR DELETE
    USING (auth.uid() = user_id);

-- 10. USER CONSENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    revoked_at TIMESTAMPTZ
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own consents"
    ON public.user_consents FOR ALL
    USING (auth.uid() = user_id);

-- 11. STORAGE BUCKET CONFIGURATION & POLICIES
-- Note: Run in Supabase SQL editor to create private storage bucket for medical files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical_records', 'medical_records', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own medical files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'medical_records' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view their own medical files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'medical_records' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own medical files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'medical_records' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
