import { NextResponse } from "next/server";
import { load as cheerioLoad } from "cheerio";

export const runtime = "nodejs";

const FEED_URL = "https://rus.baq.kz/teg/psikhologiya/";
const BASE = "https://rus.baq.kz";

let cache = { ts: 0, items: [] };
const CACHE_TTL_MS = 3 * 60 * 1000;

function normalizeSpaces(s) {
  return (s || "").replace(/\s+/g, " ").trim();
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

function extractArticles(html) {
  let $;
  try {
    if (!cheerioLoad) throw new Error('cheerio.load is not available');
    $ = cheerioLoad(html);
  } catch (e) {
    console.error('CHEERIO_LOAD_ERROR:', e);
    return [];
  }
  const found = [];
  const seen = new Set();

  // Try multiple selectors to be resilient to markup changes
  const selectors = [
    'ul.exec-news li.finded__content__item',
    'li.finded__content__item',
    'ul.news-list li',
    '.news-list li',
    'article',
    '.news-item',
    '.post',
    'ul li',
  ];

  const keywords = [
    "тревог",
    "депресс",
    "сон",
    "стресс",
    "отношен",
    "самооценк",
    "adhd",
    "психотерап",
  ];

  for (const sel of selectors) {
    const nodes = $(sel);
    if (!nodes || nodes.length === 0) continue;

    nodes.each((i, el) => {
      const $el = $(el);

      // Find anchor (prefer specific, fallback to first a)
      const linkTag = $el.find('a.finded__content__item__link, a').first();
      let href = linkTag.attr('href') || linkTag.attr('data-href') || linkTag.attr('data-url');
      if (!href) return;
      try {
        href = new URL(href, BASE).toString();
      } catch (e) {
        return;
      }
      if (seen.has(href)) return;
      seen.add(href);

      // Title: try several places
      let title = normalizeSpaces(
        $el.find('h1, h2, h3, .title, .finded__content__item__content__title').first().text()
      );
      if (!title) title = normalizeSpaces(linkTag.text() || $el.find('a').text());
      if (!title) return;

      // Summary: prefer first paragraph, else text minus title
      let summary = normalizeSpaces($el.find('p').first().text());
      if (!summary) {
        const containerText = normalizeSpaces($el.text());
        summary = containerText.replace(title, '').trim();
      }

      // Date: try data-time attribute, then nearby text
      let published_at = null;
      const dataTime = linkTag.attr('data-time') || $el.attr('data-time') || '';
      if (dataTime) published_at = parseDateFromText(String(dataTime));
      if (!published_at) {
        // look for date-like text inside element
        const maybeDate = ($el.find('.date').text() || $el.text()).trim();
        published_at = parseDateFromText(maybeDate);
      }

      // Tags: keyword scan
      const combined = (title + ' ' + summary).toLowerCase();
      const tags = keywords.filter((k) => combined.includes(k.toLowerCase()));

      found.push({
        id: href,
        title,
        url: href,
        summary: summary || '',
        published_at,
        tags,
        source: 'BAQ.kz',
      });
    });

    // If we found reasonable number of items, stop trying other selectors
    if (found.length >= 5) break;
  }

  return found.slice(0, 80);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const tag = (searchParams.get('tag') || '').trim().toLowerCase();
    // Pagination / sorting
    const page = Math.max(Number(searchParams.get('page') || 1), 1);
    const per_page_raw = Number(searchParams.get('per_page') || searchParams.get('limit') || 20);
    const PER_PAGE_MAX = 80;
    let per_page = Number.isFinite(per_page_raw) ? Math.max(0, per_page_raw) : 20;
    if (per_page === 0) per_page = PER_PAGE_MAX; // treat 0 as request for 'all' but cap
    per_page = Math.min(per_page, PER_PAGE_MAX);
    const sort = (searchParams.get('sort') || 'latest').toLowerCase(); // 'latest'|'oldest'

    const now = Date.now();
    let items = cache.items;

    if (!cache.ts || now - cache.ts > CACHE_TTL_MS || !items?.length) {
      const response = await fetch(FEED_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
          'Referer': 'https://rus.baq.kz/',
          'Connection': 'keep-alive',
        },
      });
      if (!response.ok) {
        console.warn('NEWS_FETCH_FAILED', response.status, response.statusText);
        throw new Error('Failed to fetch feed');
      }
      const html = await response.text();
      // Debugging: log first part of HTML to inspect server-side vs browser HTML
      try {
        console.log('NEWS_HTML_PREVIEW:', html.slice(0, 2000));
      } catch (e) {
        console.warn('Failed to log HTML preview', e);
      }

      // Quick check: if expected list markers are missing, try to detect XHR/API endpoints in HTML
      const hasList = html.includes('finded__content__item') || html.includes('exec-news');
      if (!hasList) {
        // try to find likely XHR endpoints or data URLs inside the HTML
        const hints = new Set();
        const reAttrs = /(?:href|src|data-url|data-href)=["']([^"']+)["']/gi;
        let m;
        while ((m = reAttrs.exec(html)) !== null) {
          const u = m[1];
          if (/ajax|api|load-more|news\?|json|/i.test(u)) hints.add(u);
        }
        const reFetch = /fetch\(["']([^"']+)["']/gi;
        while ((m = reFetch.exec(html)) !== null) {
          hints.add(m[1]);
        }
        const hintList = Array.from(hints).slice(0, 10);
        console.warn('NEWS_PARSER_HINT: HTML did not contain expected list. Possible XHR/API endpoints:', hintList);
        // proceed with empty items (caller will get empty list) but provide hint in response
        cache = { ts: now, items: [] };
        return NextResponse.json({ items: [], warning: 'Feed HTML did not contain expected news list. See server logs for NEWS_HTML_PREVIEW and NEWS_PARSER_HINT.' , hints: hintList }, { status: 200 });
      }
      items = extractArticles(html);
      cache = { ts: now, items };
    }

    // Filtering
    if (q) {
      items = items.filter((a) => (a.title + ' ' + a.summary).toLowerCase().includes(q));
    }
    if (tag) {
      items = items.filter((a) => a.tags.map((x) => x.toLowerCase()).includes(tag));
    }

    // Sorting by published_at
    function dateValue(d) {
      return d ? new Date(d).getTime() : 0;
    }
    if (sort === 'oldest') {
      items.sort((a, b) => dateValue(a.published_at) - dateValue(b.published_at));
    } else {
      items.sort((a, b) => dateValue(b.published_at) - dateValue(a.published_at));
    }

    const totalCount = items.length;
    const offset = (page - 1) * per_page;
    const paged = items.slice(offset, offset + per_page);

    return NextResponse.json({ items: paged, totalCount, page, per_page });
  } catch (err) {
    console.error('NEWS_API_ERROR:', err);
    return NextResponse.json({ items: [], error: err?.message || 'Error' }, { status: 500 });
  }
}


