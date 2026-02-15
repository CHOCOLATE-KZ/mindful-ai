import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function parseCookieHeader(cookieHeader) {
  if (!cookieHeader) return [];
  return cookieHeader
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf("=");
      if (idx === -1) return { name: pair, value: "" };
      return {
        name: pair.slice(0, idx),
        value: decodeURIComponent(pair.slice(idx + 1)),
      };
    });
}

function safeGetAllCookies(cookieStore) {
  // Next 16: cookieStore уже должен быть НЕ Promise (мы его await'им)
  if (cookieStore && typeof cookieStore.getAll === "function") {
    return cookieStore.getAll();
  }

  // Иногда можно вытащить строку cookie через toString()
  try {
    if (cookieStore && typeof cookieStore.toString === "function") {
      const raw = cookieStore.toString();
      const parsed = parseCookieHeader(raw);
      if (parsed.length) return parsed;
    }
  } catch {}

  // fallback: не падаем
  return [];
}

export async function supabaseServer() {
  // ✅ ВАЖНО: Next 16 требует await
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    {
      cookies: {
        getAll() {
          return safeGetAllCookies(cookieStore);
        },
        setAll(cookiesToSet) {
          // в server components set может быть запрещен — поэтому try/catch
          try {
            if (typeof cookieStore.set === "function") {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            }
          } catch {
            // ignore
          }
        },
      },
    }
  );
}
