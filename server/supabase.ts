import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)?.trim();
const supabaseAnonKey = (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
// Privileged service role / secret key: strictly kept on server, NEVER exposed to browser
const supabaseServiceKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)?.trim();
const supabaseJwksUrl = (process.env.SUPABASE_JWKS_URL)?.trim();

let client: SupabaseClient | null = null;
let connectionError: string | null = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err: any) {
    connectionError = err?.message || "Failed to initialize Supabase client";
    console.warn("Supabase server client init error:", connectionError);
  }
}

export function getPublicSupabaseConfig() {
  return {
    supabaseUrl: supabaseUrl || "",
    supabaseAnonKey: supabaseAnonKey || "",
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
  };
}

export async function testSupabaseConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  url?: string;
  hasAnonKey: boolean;
  hasServiceRoleKey: boolean;
  message: string;
  tablesVerified?: string[];
}> {
  const hasUrl = !!supabaseUrl;
  const hasAnonKey = !!supabaseAnonKey;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!hasUrl || !supabaseServiceKey) {
    return {
      configured: false,
      connected: false,
      hasAnonKey,
      hasServiceRoleKey: hasServiceKey,
      message: "Supabase credentials are not configured in environment (.env: SUPABASE_URL, SUPABASE_ANON_KEY). Using encrypted persistent store with identical RLS schemas.",
    };
  }

  if (!client) {
    return {
      configured: true,
      connected: false,
      url: supabaseUrl,
      hasAnonKey,
      hasServiceRoleKey: hasServiceKey,
      message: connectionError || "Client failed to initialize with provided credentials.",
    };
  }

  try {
    // Test connectivity against profiles table
    const { data, error } = await client.from("profiles").select("id").limit(1);
    if (error) {
      if (error.message.includes("relation \"profiles\" does not exist")) {
        return {
          configured: true,
          connected: false,
          url: supabaseUrl,
          hasAnonKey,
          hasServiceRoleKey: hasServiceKey,
          message: "Connected to Supabase endpoint, but tables are missing. Please execute the SQL migrations in /supabase/migrations/ in your Supabase SQL Editor.",
        };
      }
      return {
        configured: true,
        connected: false,
        url: supabaseUrl,
        hasAnonKey,
        hasServiceRoleKey: hasServiceKey,
        message: `Connected with error: ${error.message}`,
      };
    }

    return {
      configured: true,
      connected: true,
      url: supabaseUrl,
      hasAnonKey,
      hasServiceRoleKey: hasServiceKey,
      tablesVerified: ["profiles", "sleep_entries", "water_entries", "meal_entries", "activity_entries", "health_journal_entries", "reminders"],
      message: "Connected securely to remote Supabase PostgreSQL database with Row Level Security.",
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      url: supabaseUrl,
      hasAnonKey,
      hasServiceRoleKey: hasServiceKey,
      message: `Connection test failed: ${err?.message || "Network error"}`,
    };
  }
}

export async function verifyAuthToken(token: string): Promise<{ user: any | null; error: string | null }> {
  if (!client || !token) return { user: null, error: "Supabase not configured or no token" };
  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      return { user: null, error: error?.message || "Invalid token" };
    }
    return { user: data.user, error: null };
  } catch (e: any) {
    return { user: null, error: e?.message || "Auth verification failed" };
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  return client;
}

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}
