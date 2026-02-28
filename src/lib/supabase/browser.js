import { createBrowserClient } from "@supabase/ssr";

let cachedClient = null;

export const supabaseBrowser = () => {
  if (!cachedClient) {
    cachedClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return cachedClient;
};
