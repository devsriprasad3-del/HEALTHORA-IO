-- HEALTHORA 2.0 — Supabase PostgreSQL Database Schema & RLS Policies Migration
-- Version: 20261012100000
-- Wellness Tracking, Health Journal, AI Conversations, Reminders & Notifications

-- 1. SLEEP ENTRIES TABLE
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

CREATE POLICY "Users can manage their own sleep entries"
    ON public.sleep_entries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. WATER ENTRIES TABLE
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

-- Ensure time column exists if table was previously created
ALTER TABLE public.water_entries ADD COLUMN IF NOT EXISTS time TIME;

CREATE INDEX IF NOT EXISTS idx_water_entries_user_date ON public.water_entries(user_id, recorded_date DESC);
ALTER TABLE public.water_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own water entries"
    ON public.water_entries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. MEAL ENTRIES TABLE
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

CREATE POLICY "Users can manage their own meal entries"
    ON public.meal_entries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. ACTIVITY ENTRIES TABLE
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

CREATE POLICY "Users can manage their own activity entries"
    ON public.activity_entries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. MOOD ENTRIES TABLE
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

CREATE POLICY "Users can manage their own mood entries"
    ON public.mood_entries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. HEALTH JOURNAL ENTRIES TABLE
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

-- Ensure attached_document_title column exists if table was previously created
ALTER TABLE public.health_journal_entries ADD COLUMN IF NOT EXISTS attached_document_title TEXT;

CREATE INDEX IF NOT EXISTS idx_health_journal_user_date ON public.health_journal_entries(user_id, recorded_date DESC);
ALTER TABLE public.health_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own journal entries"
    ON public.health_journal_entries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. AI CONVERSATIONS & MESSAGES TABLES
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

CREATE POLICY "Users can manage their own AI conversations"
    ON public.ai_conversations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can manage their own AI messages"
    ON public.ai_messages FOR ALL
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

-- 8. REMINDERS TABLE
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

CREATE POLICY "Users can manage their own reminders"
    ON public.reminders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. USER SETTINGS & NOTIFICATION PREFERENCES TABLE
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

CREATE POLICY "Users can manage their own settings"
    ON public.user_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
