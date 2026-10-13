import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "../types/health.js";
import { getSupabaseClient, getAuthHeaders } from "../lib/supabaseClient.js";

interface AuthContextType {
  user: UserProfile | null;
  activeProfileKey: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  supabaseConnected: boolean;
  isPersonalAccount: boolean;
  switchProfile: (profileKey: string) => Promise<void>;
  resetDemo: () => Promise<void>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeProfileKey: "rajesh",
  isAuthenticated: true,
  isLoading: false,
  supabaseConnected: false,
  isPersonalAccount: false,
  switchProfile: async () => {},
  resetDemo: async () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export const DEFAULT_DEMO_USER: UserProfile = {
  id: "demo-rajesh",
  name: "Rajesh Sharma",
  email: "rajesh.sharma@example.com",
  dob: "1978-04-14",
  gender: "Male",
  bloodGroup: "B+",
  preferredLanguage: "en",
  abhaNumber: "91-4821-9032-4112",
  allergies: ["Penicillin", "Sulfa drugs"],
  chronicConditions: ["Type 2 Diabetes Mellitus", "Dyslipidemia", "Essential Hypertension"],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => DEFAULT_DEMO_USER);
  const [activeProfileKey, setActiveProfileKey] = useState<string>(() => {
    return localStorage.getItem("healthora_active_profile") || "rajesh";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Check Supabase initialization and listen for auth state
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initSupabaseAuth() {
      try {
        const client = await getSupabaseClient();
        if (client) {
          setSupabaseConnected(true);
          const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              const userEmail = session.user.email || "";
              const userName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Patient";
              // Sync with backend
              try {
                const res = await fetch("/api/auth/login", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({ email: userEmail, name: userName }),
                });
                if (res.ok) {
                  const data = await res.json();
                  setUser(data.user);
                  setActiveProfileKey(data.activeProfileKey);
                  localStorage.setItem("healthora_active_profile", data.activeProfileKey);
                  setIsAuthenticated(true);
                }
              } catch (e) {
                console.warn("Backend sync on Supabase auth change:", e);
              }
            }
          });
          unsubscribe = () => authListener.subscription.unsubscribe();
        }
      } catch (e) {
        console.warn("Supabase auth init check:", e);
      }
    }

    initSupabaseAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const authHeaders = await getAuthHeaders(activeProfileKey);
      const res = await fetch("/api/auth/me", {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveProfileKey(data.activeProfileKey || activeProfileKey);
        setIsAuthenticated(true);
      } else {
        // Fallback default demo user if API unreachable
        setUser({
          id: "demo-rajesh",
          name: "Rajesh Sharma",
          email: "rajesh.sharma@example.com",
          dob: "1978-04-14",
          gender: "Male",
          bloodGroup: "B+",
          preferredLanguage: "en",
          abhaNumber: "91-4821-9032-4112",
          allergies: ["Penicillin", "Sulfa drugs"],
          chronicConditions: ["Type 2 Diabetes Mellitus", "Dyslipidemia", "Essential Hypertension"],
        });
      }
    } catch (e) {
      console.warn("Failed to load user from API, using demo profile:", e);
      setUser({
        id: "demo-rajesh",
        name: "Rajesh Sharma",
        email: "rajesh.sharma@example.com",
        dob: "1978-04-14",
        gender: "Male",
        bloodGroup: "B+",
        preferredLanguage: "en",
        abhaNumber: "91-4821-9032-4112",
        allergies: ["Penicillin", "Sulfa drugs"],
        chronicConditions: ["Type 2 Diabetes Mellitus", "Dyslipidemia", "Essential Hypertension"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [activeProfileKey]);

  const switchProfile = async (profileKey: string) => {
    try {
      setIsLoading(true);
      const authHeaders = await getAuthHeaders(profileKey);
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ profileKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveProfileKey(data.activeProfileKey);
        localStorage.setItem("healthora_active_profile", data.activeProfileKey);
      }
    } catch (e) {
      console.error("Failed to switch demo profile:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemo = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/demo-reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveProfileKey("rajesh");
        localStorage.setItem("healthora_active_profile", "rajesh");
      }
    } catch (e) {
      console.error("Failed to reset demo:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      // If Supabase is active and password provided, try Supabase auth first
      const client = await getSupabaseClient();
      let supabaseToken: string | undefined;

      if (client && password) {
        try {
          const { data, error } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (error) {
            // If user doesn't exist in Supabase yet, attempt sign up or fallback to local
            console.warn("Supabase signIn error, checking fallback:", error.message);
          } else if (data.session) {
            supabaseToken = data.session.access_token;
          }
        } catch (e) {
          console.warn("Supabase auth call:", e);
        }
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (supabaseToken) {
        headers["Authorization"] = `Bearer ${supabaseToken}`;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers,
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveProfileKey(data.activeProfileKey);
        localStorage.setItem("healthora_active_profile", data.activeProfileKey);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || "Login failed" };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // If Supabase is active and password provided, try Supabase sign up
      const client = await getSupabaseClient();
      let supabaseToken: string | undefined;

      if (client && password) {
        try {
          const { data, error } = await client.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { full_name: cleanName },
            },
          });
          if (!error && data.session) {
            supabaseToken = data.session.access_token;
          }
        } catch (e) {
          console.warn("Supabase signUp:", e);
        }
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (supabaseToken) {
        headers["Authorization"] = `Bearer ${supabaseToken}`;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: cleanName, email: cleanEmail }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveProfileKey(data.activeProfileKey);
        localStorage.setItem("healthora_active_profile", data.activeProfileKey);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || "Registration failed" };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const client = await getSupabaseClient();
      if (client) {
        await client.auth.signOut();
      }
    } catch (e) {
      // ignore
    }
    // Switch to demo mode default
    setActiveProfileKey("rajesh");
    localStorage.setItem("healthora_active_profile", "rajesh");
    await fetchCurrentUser();
  };

  const isPersonalAccount = activeProfileKey !== "rajesh" && activeProfileKey !== "priya";

  return (
    <AuthContext.Provider
      value={{
        user,
        activeProfileKey,
        isAuthenticated,
        isLoading,
        supabaseConnected,
        isPersonalAccount,
        switchProfile,
        resetDemo,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
