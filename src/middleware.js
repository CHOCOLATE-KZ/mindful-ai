import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// добавь /chat сюда
const PROTECTED = ["/notes", "/analytics", "/profile", "/chat"];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const path = req.nextUrl.pathname;

  if (PROTECTED.some(p => path.startsWith(p)) && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (session && (path.startsWith("/auth") || path === "/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/notes";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
