import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // Log helpful hint during server startup
  // Do not throw here to avoid breaking builds, but surface helpful debug info to server logs
  // Ensure your environment has SUPABASE_SERVICE_ROLE_KEY set (not exposed to client)
  // Example: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  // NEXT_PUBLIC_SUPABASE_URL should be the Supabase URL
  // You can set these in .env.local for local development
  console.warn('supabaseAdmin: missing SUPABASE env vars. Check SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.');
}
