import { NextResponse } from "next/server";
import { load as cheerioLoad } from "cheerio";

export const runtime = "nodejs";

// Simple in-memory cache: url -> { image, ts }
const imgCache = new Map();
const TTL_MS = 30 * 60 * 1000; // 30 min

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
  "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
};

async function scrapeImage(articleUrl) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: { ...FETCH_HEADERS, Referer: new URL(articleUrl).origin + "/" },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerioLoad(html);

    // Try in priority order
    const selectors = [
      // BAQ.kz main article photo
      ".custom-container__main_photo div img",
      ".custom-container__main_photo img",
      // Generic og:image meta
      "meta[property='og:image']",
      // Twitter card
      "meta[name='twitter:image']",
      // First prominent img
      "article img",
      ".content img",
      "main img",
    ];

    for (const sel of selectors) {
      const el = $(sel).first();
      if (!el.length) continue;
      // meta tags use content attribute
      const src = el.attr("content") || el.attr("src") || el.attr("data-src") || el.attr("data-lazy");
      if (!src || src.startsWith("data:")) continue;
      // Make absolute
      try {
        return new URL(src, articleUrl).toString();
      } catch {
        return src;
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const articleUrl = searchParams.get("url");
    if (!articleUrl) {
      return NextResponse.json({ image: null }, { status: 400 });
    }

    // ?proxy=1 → fetch the image bytes server-side and stream back
    // This bypasses hotlink protection (Referer check) on external sites
    const proxy = searchParams.get("proxy") === "1";
    if (proxy) {
      const imgUrl = searchParams.get("imgUrl");
      if (!imgUrl) return new Response(null, { status: 400 });
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 10000);
      try {
        const imgRes = await fetch(imgUrl, {
          signal: controller.signal,
          headers: {
            ...FETCH_HEADERS,
            Accept: "image/*,*/*;q=0.8",
            Referer: new URL(imgUrl).origin + "/",
          },
          cache: "no-store",
        });
        if (!imgRes.ok) return new Response(null, { status: 502 });
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        const buf = await imgRes.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
          },
        });
      } finally {
        clearTimeout(t);
      }
    }

    // Normal mode: scrape article page and return image URL
    const now = Date.now();
    const cached = imgCache.get(articleUrl);
    if (cached && now - cached.ts < TTL_MS) {
      return NextResponse.json({ image: cached.image });
    }

    const image = await scrapeImage(articleUrl);
    imgCache.set(articleUrl, { image, ts: now });

    return NextResponse.json({ image });
  } catch (err) {
    return NextResponse.json({ image: null, error: err?.message }, { status: 500 });
  }
}
