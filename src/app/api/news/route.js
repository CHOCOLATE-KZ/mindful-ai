import { NextResponse } from "next/server";
import { load as cheerioLoad } from "cheerio";

export const runtime = "nodejs";

/** =========================
 *  CONFIG
 *  ========================= */
const BASE_BAQ = "https://rus.baq.kz";
const FEED_BAQ = "https://rus.baq.kz/teg/psikhologiya/";

// RSS sources (stable to parse)
const RSS_SOURCES = [
  {
    id: "Sadaq.kz",
    url: "https://sadaq.kz/ru/rss/category/zdorove", // Health RSS :contentReference[oaicite:2]{index=2}
  },
  {
    id: "PsyJournals",
    url: "https://psyjournals.ru/rss", // RSS index :contentReference[oaicite:3]{index=3}
  },
];

// Caching
let cache = { ts: 0, items: [] };
const CACHE_TTL_MS = 3 * 60 * 1000;

// Tagging
const TAG_KEYWORDS = [
  "тревог",
  "депресс",
  "сон",
  "стресс",
  "отношен",
  "самооценк",
  "adhd",
  "психотерап",
];

// UI tag -> keyword root (fixes your tag mismatch)
const TAG_MAP = {
  "тревога": "тревог",
  "депрессия": "депресс",
  "сон": "сон",
  "стресс": "стресс",
  "отношения": "отношен",
  "самооценка": "самооценк",
  "adhd": "adhd",
  "психотерапия": "психотерап",
};

/** =========================
 *  HELPERS
 *  ========================= */
function normalizeSpaces(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function stripHtml(html) {
  if (!html) return "";
  try {
    const $ = cheerioLoad(html);
    return normalizeSpaces($.text());
  } catch {
    return normalizeSpaces(String(html).replace(/<[^>]*>/g, " "));
  }
}

function toISODateMaybe(d) {
  if (!d) return null;
  const ms = Date.parse(d);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

function parseDateFromText(text) {
  if (!text) return null;
  // dd.mm.yyyy
  const m1 = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m1) {
    const dd = m1[1].padStart(2, "0");
    const mm = m1[2].padStart(2, "0");
    const yyyy = m1[3];
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`).toISOString();
  }
  // yyyy-mm-dd
  const m2 = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m2) {
    const yyyy = m2[1];
    const mm = m2[2].padStart(2, "0");
    const dd = m2[3].padStart(2, "0");
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`).toISOString();
  }
  return null;
}

function dateValue(d) {
  return d ? new Date(d).getTime() : 0;
}

async function fetchWithTimeout(url, { timeoutMs = 12000, headers = {} } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        ...headers,
      },
      cache: "no-store",
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

function computeTags(title, summary) {
  const combined = (title + " " + summary).toLowerCase();
  return TAG_KEYWORDS.filter((k) => combined.includes(k));
}

/** =========================
 *  BAQ PARSER (HTML)
 *  ========================= */
function extractArticlesFromBAQ(html) {
  let $;
  try {
    $ = cheerioLoad(html);
  } catch (e) {
    console.error("BAQ_CHEERIO_ERROR:", e);
    return [];
  }

  const found = [];
  const seen = new Set();

  const selectors = [
    "ul.exec-news li.finded__content__item",
    "li.finded__content__item",
    "ul.news-list li",
    ".news-list li",
    "article",
    ".news-item",
    ".post",
  ];

  for (const sel of selectors) {
    const nodes = $(sel);
    if (!nodes || nodes.length === 0) continue;

    nodes.each((i, el) => {
      const $el = $(el);

      const linkTag = $el.find("a.finded__content__item__link, a").first();
      let href = linkTag.attr("href") || linkTag.attr("data-href") || linkTag.attr("data-url");
      if (!href) return;

      try {
        href = new URL(href, BASE_BAQ).toString();
      } catch {
        return;
      }

      if (seen.has(href)) return;
      seen.add(href);

      let title = normalizeSpaces(
        $el.find("h1, h2, h3, .title, .finded__content__item__content__title").first().text()
      );
      if (!title) title = normalizeSpaces(linkTag.text() || $el.find("a").text());
      if (!title) return;

      let summary = normalizeSpaces($el.find("p").first().text());
      if (!summary) {
        const containerText = normalizeSpaces($el.text());
        summary = containerText.replace(title, "").trim();
      }

      let published_at = null;
      const dataTime = linkTag.attr("data-time") || $el.attr("data-time") || "";
      if (dataTime) published_at = parseDateFromText(String(dataTime));
      if (!published_at) {
        const maybeDate = ($el.find(".date").text() || $el.text()).trim();
        published_at = parseDateFromText(maybeDate) || toISODateMaybe(maybeDate);
      }

      const tags = computeTags(title, summary);

      found.push({
        id: href,
        title,
        url: href,
        summary: summary || "",
        published_at,
        tags,
        source: "BAQ.kz",
        rank: i,
      });
    });

    if (found.length >= 5) break;
  }

  return found.slice(0, 80);
}

async function fetchBAQ() {
  const res = await fetchWithTimeout(FEED_BAQ, {
    timeoutMs: 12000,
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Referer: "https://rus.baq.kz/",
    },
  });

  if (!res.ok) throw new Error(`BAQ fetch failed: ${res.status}`);

  const html = await res.text();
  const hasList = html.includes("finded__content__item") || html.includes("exec-news");
  if (!hasList) {
    console.warn("BAQ: expected list markers not found (content may be client-rendered).");
    return [];
  }

  return extractArticlesFromBAQ(html);
}

/** =========================
 *  RSS PARSER
 *  ========================= */
function parseRSS(xml, sourceName) {
  let $;
  try {
    $ = cheerioLoad(xml, { xmlMode: true });
  } catch (e) {
    console.error("RSS_PARSE_ERROR:", sourceName, e);
    return [];
  }

  const items = [];
  $("item").each((i, el) => {
    const $it = $(el);

    const title = normalizeSpaces($it.find("title").first().text());
    let link = normalizeSpaces($it.find("link").first().text());
    if (!link) link = normalizeSpaces($it.find("guid").first().text());
    if (!title || !link) return;

    const descRaw =
      $it.find("description").first().text() ||
      $it.find("content\\:encoded").first().text() ||
      "";
    const summary = normalizeSpaces(stripHtml(descRaw));

    const pubRaw =
      $it.find("pubDate").first().text() ||
      $it.find("dc\\:date").first().text() ||
      "";
    const published_at = toISODateMaybe(pubRaw);

    const tags = computeTags(title, summary);

    items.push({
      id: link,
      title,
      url: link,
      summary,
      published_at,
      tags,
      source: sourceName,
      rank: i,
    });
  });

  return items.slice(0, 80);
}

async function fetchRSS(source) {
  const res = await fetchWithTimeout(source.url, { timeoutMs: 12000 });
  if (!res.ok) throw new Error(`${source.id} RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  return parseRSS(xml, source.id);
}

/** =========================
 *  AGGREGATOR
 *  ========================= */
async function refreshAggregate() {
  const jobs = [
    fetchBAQ().then((x) => ({ ok: true, items: x, name: "BAQ" })).catch((e) => ({ ok: false, items: [], name: "BAQ", error: e })),
    ...RSS_SOURCES.map((s) =>
      fetchRSS(s)
        .then((x) => ({ ok: true, items: x, name: s.id }))
        .catch((e) => ({ ok: false, items: [], name: s.id, error: e }))
    ),
  ];

  const settled = await Promise.all(jobs);

  // Merge + dedupe by URL
  const merged = [];
  const seen = new Set();

  for (const r of settled) {
    if (!r.ok) console.warn("NEWS_SOURCE_FAIL:", r.name, r.error?.message || r.error);
    for (const it of r.items || []) {
      const key = it?.url || it?.id;
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(it);
    }
  }

  // cap to keep memory small
  return merged.slice(0, 250);
}

/** =========================
 *  API HANDLER
 *  ========================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const tagRaw = (searchParams.get("tag") || "").trim().toLowerCase();
    const tag = TAG_MAP[tagRaw] || tagRaw;

    const page = Math.max(Number(searchParams.get("page") || 1), 1);

    const per_page_raw = Number(searchParams.get("per_page") || searchParams.get("limit") || 20);
    const PER_PAGE_MAX = 80;
    let per_page = Number.isFinite(per_page_raw) ? Math.max(0, per_page_raw) : 20;
    if (per_page === 0) per_page = PER_PAGE_MAX;
    per_page = Math.min(per_page, PER_PAGE_MAX);

    const sort = (searchParams.get("sort") || "latest").toLowerCase(); // latest|oldest

    const now = Date.now();
    let items = cache.items;

    if (!cache.ts || now - cache.ts > CACHE_TTL_MS || !items?.length) {
      items = await refreshAggregate();
      cache = { ts: now, items };
    }

    // Filter
    if (q) {
      items = items.filter((a) => (a.title + " " + a.summary).toLowerCase().includes(q));
    }
    if (tag) {
      items = items.filter((a) => (a.tags || []).map((x) => String(x).toLowerCase()).includes(tag));
    }

    // Sort (date first, then rank)
    if (sort === "oldest") {
      items.sort((a, b) => {
        const da = dateValue(a.published_at);
        const db = dateValue(b.published_at);
        if (da && db) return da - db;
        if (da && !db) return -1;
        if (!da && db) return 1;
        return (a.rank ?? 0) - (b.rank ?? 0);
      });
    } else {
      items.sort((a, b) => {
        const da = dateValue(a.published_at);
        const db = dateValue(b.published_at);
        if (da && db) return db - da;
        if (da && !db) return -1;
        if (!da && db) return 1;
        return (a.rank ?? 0) - (b.rank ?? 0);
      });
    }

    const totalCount = items.length;
    const offset = (page - 1) * per_page;
    const paged = items.slice(offset, offset + per_page);
    const hasMore = offset + per_page < totalCount;

    return NextResponse.json({ items: paged, totalCount, page, per_page, hasMore });
  } catch (err) {
    console.error("NEWS_API_ERROR:", err);
    return NextResponse.json({ items: [], error: err?.message || "Error" }, { status: 500 });
  }
}
