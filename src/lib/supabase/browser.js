// src/lib/supabase/browser.js
// src/lib/supabase/browser.js
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabaseBrowser = () => createClientComponentClient();

