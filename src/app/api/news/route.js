import { NextResponse } from "next/server";
import { load as cheerioLoad } from "cheerio";

export const runtime = "nodejs";

/** =========================
 *  CONFIG
 *  ========================= */
const BASE_BAQ = "https://rus.baq.kz";
const FEED_BAQ = "https://rus.baq.kz/teg/psikhologiya/";
const BASE_SEZ = "https://sez.im";
const FEED_SEZ = "https://sez.im/blog";
const FEED_SEZ_FALLBACK = "https://r.jina.ai/http://sez.im/blog";

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

function parseRuMonthDate(text) {
  if (!text) return null;

  const months = {
    янв: "01",
    фев: "02",
    мар: "03",
    апр: "04",
    май: "05",
    июн: "06",
    июл: "07",
    авг: "08",
    сен: "09",
    окт: "10",
    ноя: "11",
    дек: "12",
  };

  const m = text.match(/(\d{1,2})\s+([А-Яа-яЁё]{3,})\s+(\d{4})/);
  if (!m) return null;

  const dd = m[1].padStart(2, "0");
  const monthKey = m[2].toLowerCase().slice(0, 3);
  const yyyy = m[3];
  const mm = months[monthKey];
  if (!mm) return null;

  return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`).toISOString();
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

      // Extract thumbnail from list item
      const imgEl = $el.find("img").first();
      let image = (imgEl.attr("src") || imgEl.attr("data-src") || imgEl.attr("data-lazy") || "").trim() || null;
      if (image) {
        try { image = new URL(image, BASE_BAQ).toString(); } catch { /* keep as-is */ }
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
        image: image || null,
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
 *  SEZ.IM PARSER (HTML)
 *  ========================= */
function isPossibleDateText(text) {
  return Boolean(text.match(/\d{1,2}\s+[А-Яа-яЁё]{3,}\s+\d{4}/));
}

function isPossibleViewsText(text) {
  return Boolean(text.match(/^\d[\d\s]*$/));
}

function cleanSummaryText(text) {
  return normalizeSpaces(String(text || "").replace(/<br\s*\/?>/gi, " "));
}

function extractArticlesFromSEZ(html) {
  let $;
  try {
    $ = cheerioLoad(html);
  } catch (e) {
    console.error("SEZ_CHEERIO_ERROR:", e);
    return [];
  }

  const found = [];
  const seen = new Set();

  $("a[href*='/blog_article?art_id=']").each((i, el) => {
    const $a = $(el);
    const title = normalizeSpaces($a.text());
    if (!title) return;

    let href = $a.attr("href") || "";
    try {
      href = new URL(href, BASE_SEZ).toString();
    } catch {
      return;
    }

    if (seen.has(href)) return;
    seen.add(href);

    const $card = $a.closest("div.clickable-element, div.group-item, article, li, .bubble-r-container");
    if (!$card || !$card.length) return;

    const texts = [];
    $card.find("div, p, span").each((_, n) => {
      const t = normalizeSpaces($(n).text());
      if (t) texts.push(t);
    });

    const dateText = texts.find((t) => isPossibleDateText(t)) || "";
    const published_at =
      parseRuMonthDate(dateText) ||
      parseDateFromText(dateText) ||
      toISODateMaybe(dateText);

    const views = texts.find((t) => isPossibleViewsText(t)) || "";

    const category =
      texts.find(
        (t) =>
          t !== title &&
          !isPossibleDateText(t) &&
          !isPossibleViewsText(t) &&
          t.length >= 4 &&
          t.length <= 50
      ) || "Психология";

    const summaryCandidate =
      texts.find(
        (t) =>
          t !== title &&
          t !== category &&
          !isPossibleDateText(t) &&
          !isPossibleViewsText(t) &&
          t.length > 35
      ) || "";

    const summary = cleanSummaryText(summaryCandidate);
    const tags = computeTags(`${category} ${title}`, summary);

    // Extract thumbnail from card
    const imgEl = $card.find("img").first();
    let image = imgEl.attr("src") || imgEl.attr("data-src") || imgEl.attr("data-lazy") || null;
    if (image && image.startsWith("/")) image = BASE_SEZ + image;

    found.push({
      id: href,
      title,
      url: href,
      summary,
      published_at,
      tags,
      source: "SEZ.im",
      image: image || null,
      rank: i,
      views,
      category,
    });
  });

  return found.slice(0, 120);
}

function extractArticlesFromSEZFallbackMarkdown(mdText) {
  const text = String(mdText || "");
  const found = [];
  const seen = new Set();

  // [Title](https://sez.im/blog_article?art_id=...)
  const re = /\[([^\]]+)\]\((https?:\/\/sez\.im\/blog_article\?art_id=[^)\s]+)\)/g;

  let match;
  let rank = 0;
  while ((match = re.exec(text)) !== null) {
    const title = normalizeSpaces(match[1]);
    const url = normalizeSpaces(match[2]);
    if (!title || !url || seen.has(url)) continue;
    seen.add(url);

    const idx = match.index;
    const context = text.slice(Math.max(0, idx - 260), Math.min(text.length, idx + 420));

    const dateText = (context.match(/\d{1,2}\s+[А-Яа-яЁё]{3,}\s+\d{4}/) || [""])[0];
    const published_at =
      parseRuMonthDate(dateText) ||
      parseDateFromText(dateText) ||
      toISODateMaybe(dateText);

    // Nearest heading-ish line before link as category fallback.
    const before = text.slice(Math.max(0, idx - 220), idx).split(/\r?\n/).map((s) => normalizeSpaces(s)).filter(Boolean);
    const category = (before.reverse().find((line) => line.length >= 4 && line.length <= 60 && !line.startsWith("[") && !isPossibleDateText(line)) || "Психология").replace(/^#+\s*/, "");

    const after = text.slice(idx, Math.min(text.length, idx + 420));
    const summary = normalizeSpaces(after.replace(/\[[^\]]+\]\([^)]+\)/g, "").replace(/\s+/g, " ")).slice(0, 220);

    const tags = computeTags(`${category} ${title}`, summary);

    found.push({
      id: url,
      title,
      url,
      summary,
      published_at,
      tags,
      source: "SEZ.im",
      rank: rank++,
      category,
    });
  }

  return found.slice(0, 120);
}

/** Scrape og:image from an article page */
async function scrapeOgImage(articleUrl) {
  try {
    const res = await fetchWithTimeout(articleUrl, { timeoutMs: 7000 });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m ? m[1] : null;
  } catch { return null; }
}

async function fetchSEZ() {
  const primary = await fetchWithTimeout(FEED_SEZ, {
    timeoutMs: 14000,
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Referer: BASE_SEZ,
    },
  });

  if (!primary.ok) throw new Error(`SEZ fetch failed: ${primary.status}`);

  const html = await primary.text();
  if (html.includes("blog_article?art_id=")) {
    const fromHtml = extractArticlesFromSEZ(html);
    if (fromHtml.length) {
      // Параллельно скрапим og:image для первых 10 статей
      await Promise.all(fromHtml.slice(0, 10).map(async (art) => {
        if (art.image) return;
        const img = await scrapeOgImage(art.url);
        if (img) art.image = img;
      }));
      return fromHtml;
    }
  }

  // Bubble pages often render list client-side only; fallback to rendered markdown mirror.
  const fallbackRes = await fetchWithTimeout(FEED_SEZ_FALLBACK, { timeoutMs: 16000 });
  if (!fallbackRes.ok) return [];
  const markdown = await fallbackRes.text();
  const fromMd = extractArticlesFromSEZFallbackMarkdown(markdown);
  // Параллельно скрапим og:image для первых 10 статей из markdown
  await Promise.all(fromMd.slice(0, 10).map(async (art) => {
    if (art.image) return;
    const img = await scrapeOgImage(art.url);
    if (img) art.image = img;
  }));
  return fromMd;
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

    // Extract image from RSS: media:content, enclosure, or first img in description
    let image =
      $it.find("media\\:content").attr("url") ||
      $it.find("enclosure").attr("url") ||
      null;
    if (!image) {
      const imgMatch = descRaw.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) image = imgMatch[1];
    }

    const tags = computeTags(title, summary);

    items.push({
      id: link,
      title,
      url: link,
      summary,
      published_at,
      tags,
      source: sourceName,
      image: image || null,
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
    fetchSEZ().then((x) => ({ ok: true, items: x, name: "SEZ" })).catch((e) => ({ ok: false, items: [], name: "SEZ", error: e })),
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
    const paged = items.slice(offset, offset + per_page).map((it) => ({
      ...it,
      // Wrap external images in server-side proxy to bypass hotlink protection
      // cdn.bubble.io (sez.im) does NOT need proxy — serve directly
      image: it.image && !it.image.startsWith("/") && !it.image.includes("cdn.bubble.io")
        ? `/api/news/image?proxy=1&imgUrl=${encodeURIComponent(it.image)}`
        : (it.image || null),
    }));
    const hasMore = offset + per_page < totalCount;

    return NextResponse.json({ items: paged, totalCount, page, per_page, hasMore });
  } catch (err) {
    console.error("NEWS_API_ERROR:", err);
    return NextResponse.json({ items: [], error: err?.message || "Error" }, { status: 500 });
  }
}
