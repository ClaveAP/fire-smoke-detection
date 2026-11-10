import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getCredentials() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  return { url, key };
}

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith("https://") &&
    key.length > 20
  );
};

let _supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (_supabaseInstance) return _supabaseInstance;
  const { url, key } = getCredentials();
  if (url && key && url.startsWith("https://") && key.length > 20) {
    _supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _supabaseInstance;
};

// Singleton export
export const supabase: SupabaseClient | null = getSupabase();
