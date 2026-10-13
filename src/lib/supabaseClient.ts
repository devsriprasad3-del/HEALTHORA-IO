import { createClient, SupabaseClient, User, Session } from "@supabase/supabase-js";

// Safe public client configuration
// Note: Privileged service role keys are NEVER imported or accessed here.
let clientInstance: SupabaseClient | null = null;
let clientInitialized = false;

// Attempt immediate init from build-time Vite environment variables if present
const buildTimeUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const buildTimeAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (buildTimeUrl && buildTimeAnonKey) {
  try {
    clientInstance = createClient(buildTimeUrl, buildTimeAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    });
    clientInitialized = true;
  } catch (e) {
    console.warn("Failed to init Supabase client from Vite env:", e);
  }
}

/**
 * Ensures the Supabase client is initialized.
 * If not initialized via build-time env vars, fetches the safe public config from the backend.
 */
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (clientInstance) return clientInstance;
  if (clientInitialized) return null;

  try {
    const res = await fetch("/api/config/public");
    if (res.ok) {
      const config = await res.json();
      if (config.supabaseUrl && config.supabaseAnonKey) {
        clientInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: typeof window !== "undefined" ? window.localStorage : undefined,
          },
        });
        clientInitialized = true;
        return clientInstance;
      }
    }
  } catch (err) {
    console.warn("Could not fetch public Supabase config from server:", err);
  }

  clientInitialized = true;
  return null;
}

export function getSyncSupabaseClient(): SupabaseClient | null {
  return clientInstance;
}

export async function isSupabaseReady(): Promise<boolean> {
  const client = await getSupabaseClient();
  return !!client;
}

export async function getCurrentSession(): Promise<Session | null> {
  const client = await getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getSession();
    return data.session;
  } catch (e) {
    return null;
  }
}

export async function getAuthHeaders(userId?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (userId) {
    headers["x-user-id"] = userId;
  }
  const session = await getCurrentSession();
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}
