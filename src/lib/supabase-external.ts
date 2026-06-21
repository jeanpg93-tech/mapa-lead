// Cliente Supabase EXTERNO do MapaLead.
// Lê VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY do .env.
// Enquanto as credenciais não estiverem configuradas, retorna null
// e a aplicação opera com dados mockados (src/lib/mock-data.ts).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabaseExternal: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    })
  : null;
