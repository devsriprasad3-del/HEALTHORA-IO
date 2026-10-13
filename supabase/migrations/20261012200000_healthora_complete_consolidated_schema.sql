-- ============================================================================
-- HEALTHORA 2.0 — COMPLETE CONSOLIDATED SUPABASE POSTGRESQL SCHEMA & MIGRATION
-- File: /supabase/migrations/20261012200000_healthora_complete_consolidated_schema.sql
-- Description: Fully idempotent, non-destructive migration script covering all
--              Healthora features: Profiles, Medical Records & Documents,
--              Lab Results & Observations, Medications & Reminders, Daily Tracking
--              (Sleep, Water, Meals, Activity, Mood, Vitals), Health Journal,
--              AI Conversations & Messages, Custom Reminders, and User Settings.
-- Security: HIPAA Security Rule & ABDM aligned; Row Level Security (RLS) on all tables;
--           Private S3-compatible medical_records bucket isolation.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. USER PROFILES & AUTHENTICATION TRIGGER
-- ============================================================================
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

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can delete their own profile') THEN
        CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);
    END IF;
END $$;

-- Automated profile provisioning trigger when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, preferred_name, preferred_language, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User'),
        'en',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_settings (user_id, updated_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. USER SETTINGS & NOTIFICATION PREFERENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    water_target_ml INT DEFAULT 2500 NOT NULL,
    sleep_target_hours NUMERIC(4,2) DEFAULT 8.0 NOT NULL,
    activity_target_minutes INT DEFAULT 45 NOT NULL,
    time_zone TEXT DEFAULT 'Asia/Kolkata' NOT NULL,
    ai_preferred_language TEXT DEFAULT 'en' CHECK (ai_preferred_language IN ('en', 'hi')),
    ai_response_detail TEXT DEFAULT 'balanced' CHECK (ai_response_detail IN ('concise', 'balanced', 'detailed')),
    enable_browser_notifications BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can manage their own settings') THEN
        CREATE POLICY "Users can manage their own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 4. MEDICAL DOCUMENTS & PRIVATE STORAGE
-- ============================================================================
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

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_documents' AND policyname = 'Users can view their own documents') THEN
        CREATE POLICY "Users can view their own documents" ON public.medical_documents FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_documents' AND policyname = 'Users can insert their own documents') THEN
        CREATE POLICY "Users can insert their own documents" ON public.medical_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_documents' AND policyname = 'Users can update their own documents') THEN
        CREATE POLICY "Users can update their own documents" ON public.medical_documents FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medical_documents' AND policyname = 'Users can delete their own documents') THEN
        CREATE POLICY "Users can delete their own documents" ON public.medical_documents FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Private medical storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical_records', 'medical_records', false)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload their own medical files') THEN
        CREATE POLICY "Users can upload their own medical files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'medical_records' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can view their own medical files') THEN
        CREATE POLICY "Users can view their own medical files" ON storage.objects FOR SELECT USING (bucket_id = 'medical_records' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete their own medical files') THEN
        CREATE POLICY "Users can delete their own medical files" ON storage.objects FOR DELETE USING (bucket_id = 'medical_records' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
END $$;

-- ============================================================================
-- 5. DOCUMENT EXTRACTIONS & AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.medical_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    extracted_json JSONB NOT NULL,
    model_version TEXT DEFAULT 'gemini-2.5-flash' NOT NULL,
    review_status TEXT DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed', 'verified', 'corrected')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_extractions' AND policyname = 'Users can manage their own document extractions') THEN
        CREATE POLICY "Users can manage their own document extractions" ON public.document_extractions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 6. HEALTH SUMMARIES (Bilingual plain-language clinical insights)
-- ============================================================================
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

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'health_summaries' AND policyname = 'Users can manage their own health summaries') THEN
        CREATE POLICY "Users can manage their own health summaries" ON public.health_summaries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 7. LAB RESULTS TABLE (Granular Biomarker Observations)
-- ============================================================================
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

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lab_results' AND policyname = 'Users can manage their own lab results') THEN
        CREATE POLICY "Users can manage their own lab results" ON public.lab_results FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 8. MEDICATIONS & MEDICATION REMINDERS
-- ============================================================================
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

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medications' AND policyname = 'Users can manage their own medications') THEN
        CREATE POLICY "Users can manage their own medications" ON public.medications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

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

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medication_reminders' AND policyname = 'Users can manage their own medication reminders') THEN
        CREATE POLICY "Users can manage their own medication reminders" ON public.medication_reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 9. DAILY TRACKING: SLEEP ENTRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sleep_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    bedtime TIME NOT NULL,
    wake_time TIME NOT NULL,
    duration_hours NUMERIC(4,2) NOT NULL CHECK (duration_hours >= 0 AND duration_hours <= 24),
    quality TEXT NOT NULL CHECK (quality IN ('poor', 'fair', 'good', 'excellent')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_sleep_entries_user_date ON public.sleep_entries(user_id, recorded_date DESC);
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sleep_entries' AND policyname = 'Users can manage their own sleep entries') THEN
        CREATE POLICY "Users can manage their own sleep entries" ON public.sleep_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 10. DAILY TRACKING: WATER INTAKE ENTRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.water_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    amount_ml INT NOT NULL CHECK (amount_ml >= 0),
    unit TEXT DEFAULT 'ml' CHECK (unit IN ('ml', 'l')),
    target_ml INT DEFAULT 2500 NOT NULL,
    time TIME,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.water_entries ADD COLUMN IF NOT EXISTS time TIME;

CREATE INDEX IF NOT EXISTS idx_water_entries_user_date ON public.water_entries(user_id, recorded_date DESC);
ALTER TABLE public.water_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'water_entries' AND policyname = 'Users can manage their own water entries') THEN
        CREATE POLICY "Users can manage their own water entries" ON public.water_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 11. DAILY TRACKING: MEAL ENTRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.meal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    meal_name TEXT NOT NULL,
    foods TEXT NOT NULL,
    calories INT CHECK (calories >= 0),
    protein_g NUMERIC(5,1) CHECK (protein_g >= 0),
    carbs_g NUMERIC(5,1) CHECK (carbs_g >= 0),
    fat_g NUMERIC(5,1) CHECK (fat_g >= 0),
    is_ai_estimated BOOLEAN DEFAULT false NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meal_entries_user_date ON public.meal_entries(user_id, recorded_date DESC);
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meal_entries' AND policyname = 'Users can manage their own meal entries') THEN
        CREATE POLICY "Users can manage their own meal entries" ON public.meal_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 12. DAILY TRACKING: ACTIVITY ENTRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    activity_type TEXT NOT NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes >= 0),
    steps INT CHECK (steps >= 0),
    distance_km NUMERIC(5,2) CHECK (distance_km >= 0),
    intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')),
    calories_burned INT CHECK (calories_burned >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_entries_user_date ON public.activity_entries(user_id, recorded_date DESC);
ALTER TABLE public.activity_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_entries' AND policyname = 'Users can manage their own activity entries') THEN
        CREATE POLICY "Users can manage their own activity entries" ON public.activity_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 13. DAILY TRACKING: MOOD ENTRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    mood TEXT NOT NULL CHECK (mood IN ('great', 'good', 'neutral', 'low', 'stressed', 'anxious')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON public.mood_entries(user_id, recorded_date DESC);
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_entries' AND policyname = 'Users can manage their own mood entries') THEN
        CREATE POLICY "Users can manage their own mood entries" ON public.mood_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 14. HEALTH JOURNAL ENTRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.health_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    clinician_questions TEXT[] DEFAULT ARRAY[]::TEXT[],
    attached_document_id UUID REFERENCES public.medical_documents(id) ON DELETE SET NULL,
    attached_document_title TEXT,
    ai_summary_en TEXT,
    ai_summary_hi TEXT,
    appointment_prep_list TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.health_journal_entries ADD COLUMN IF NOT EXISTS attached_document_title TEXT;

CREATE INDEX IF NOT EXISTS idx_health_journal_user_date ON public.health_journal_entries(user_id, recorded_date DESC);
ALTER TABLE public.health_journal_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'health_journal_entries' AND policyname = 'Users can manage their own journal entries') THEN
        CREATE POLICY "Users can manage their own journal entries" ON public.health_journal_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 15. AI CONVERSATIONS & MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    page_context TEXT DEFAULT 'overview',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id, updated_at DESC);
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can manage their own AI conversations') THEN
        CREATE POLICY "Users can manage their own AI conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::JSONB,
    page_context TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id, created_at ASC);
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_messages' AND policyname = 'Users can manage their own AI messages') THEN
        CREATE POLICY "Users can manage their own AI messages" ON public.ai_messages FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.ai_conversations c
                    WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.ai_conversations c
                    WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- ============================================================================
-- 16. REMINDERS & NOTIFICATION SCHEDULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('water', 'sleep', 'activity', 'meal', 'journal', 'appointment', 'medication', 'custom')),
    reminder_date DATE NOT NULL,
    reminder_time TIME NOT NULL,
    recurrence TEXT DEFAULT 'once' CHECK (recurrence IN ('once', 'daily', 'weekly', 'weekdays')),
    enabled BOOLEAN DEFAULT true NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    snoozed_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON public.reminders(user_id, reminder_date ASC);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reminders' AND policyname = 'Users can manage their own reminders') THEN
        CREATE POLICY "Users can manage their own reminders" ON public.reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 17. LEGACY WELLNESS & USER CONSENTS
-- ============================================================================
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

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wellness_entries' AND policyname = 'Users can manage their own wellness entries') THEN
        CREATE POLICY "Users can manage their own wellness entries" ON public.wellness_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.health_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('document', 'lab', 'medication', 'wellness', 'clinical_note', 'journal')),
    source_document_id UUID REFERENCES public.medical_documents(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    summary_hi TEXT,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.health_timeline_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'health_timeline_events' AND policyname = 'Users can manage their own timeline events') THEN
        CREATE POLICY "Users can manage their own timeline events" ON public.health_timeline_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    revoked_at TIMESTAMPTZ
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_consents' AND policyname = 'Users can manage their own consents') THEN
        CREATE POLICY "Users can manage their own consents" ON public.user_consents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
