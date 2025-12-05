// src/lib/supabaseClient.js
// import { createClient } from '@supabase/supabase-js';

// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//   {
//     auth: {
//       persistSession: true,
//       autoRefreshToken: true,
//     },
//   }
// );

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);
