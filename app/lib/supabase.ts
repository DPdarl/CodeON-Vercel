import { createClient } from "@supabase/supabase-js";

// Ensure these exist in your .env file
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Check your .env file.");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      // Keep socket alive for auto reconnect
      keepalive: 30,
      // Detect disconnect
      pingInterval: 15000,
    },
  },
});
