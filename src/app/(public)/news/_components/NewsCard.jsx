import { Eye, Clock, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffH = Math.floor(diffMs / 36e5);
  const diffD = Math.floor(diffMs / 864e5);
  if (diffH < 1) return "Только что";
  if (diffH < 24) return `Сегодня ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffD < 7) return `${diffD} дн. назад`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

const TAG_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-teal-100 text-teal-700",
];

function tagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) & 0xff;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

const GRADIENTS = [
  ["#74AA9C", "#2d7a6e"],
  ["#3b82f6", "#312e81"],
  ["#7c3aed", "#4c1d95"],
  ["#0d9488", "#0369a1"],
  ["#be185d", "#7c2d12"],
];

async function fetchArticleImage(url) {
  try {
    const res = await fetch(`/api/news/image?url=${encodeURIComponent(url)}`);
    const d = await res.json();
    if (!d.image) return null;
    // Proxy the scraped image URL through our server
    return `/api/news/image?proxy=1&imgUrl=${encodeURIComponent(d.image)}`;
  } catch {
    return null;
  }
}

/** Single slide background — pure display, no fetching */
function SlideBackground({ news, image, gradIdx, visible }) {
  const [c1, c2] = GRADIENTS[gradIdx % GRADIENTS.length];

  return (
    <div
      className="absolute inset-0 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      {image ? (
        <Image
          src={image}
          alt={news.title}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="absolute inset-0 object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
          />
        </div>
      )}
      {/* Always-on dark overlay for text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
    </div>
  );
}

/** Featured news slider */
export function FeaturedSlider({ items }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  // images[i]: API уже возвращает proxy URL, берём напрямую
  const [images, setImages] = useState(() => items.map((it) => it.image || null));
  const fetchedRef = useRef(new Set());
  const imagesRef = useRef(images);
  useEffect(() => { imagesRef.current = images; }, [images]);
  const total = items.length;

  // Если API не вернул картинку — пробуем скрапить страницу статьи
  const fetchImage = useCallback(async (idx) => {
    const item = items[idx];
    if (!item?.url || fetchedRef.current.has(idx)) return;
    fetchedRef.current.add(idx);
    if (imagesRef.current[idx]) return;
    const img = await fetchArticleImage(item.url);
    if (img) setImages((prev) => { const next = [...prev]; next[idx] = img; return next; });
  }, [items]);

  // On mount: fetch current first, then the rest with a small delay between each
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchImage(0);
      for (let i = 1; i < items.length; i++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 800)); // stagger requests
        if (cancelled) return;
        await fetchImage(i);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When slide changes, eagerly fetch that slide's image if not yet done
  useEffect(() => {
    fetchImage(current);
    const nextIdx = (current + 1) % total;
    fetchImage(nextIdx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next, total]);

  const news = items[current];

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-xl h-[440px] select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide backgrounds */}
      {items.map((item, i) => (
        <SlideBackground
          key={item.url || i}
          news={item}
          image={images[i]}
          gradIdx={i}
          visible={i === current}
        />
      ))}

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
        {/* Source badge */}
        <div className="absolute top-5 left-5">
          <span className="px-2.5 py-1 rounded-md bg-black/50 text-white text-xs font-bold backdrop-blur-sm border border-white/10 uppercase tracking-wide">
            {news.source || "Новости"}
          </span>
        </div>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm border border-white/15 transition-all hover:scale-110"
              aria-label="Предыдущая"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm border border-white/15 transition-all hover:scale-110"
              aria-label="Следующая"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Tags & date */}
        <div className="flex items-center gap-3 mb-3">
          {(news.tags || []).slice(0, 1).map((tg) => (
            <span key={tg} className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/20">
              {tg}
            </span>
          ))}
          <span className="text-white/80 text-xs flex items-center gap-1.5 font-medium">
            <Clock size={12} />
            {formatDate(news.published_at)}
          </span>
        </div>

        <a
          href={news.url}
          target="_blank"
          rel="noreferrer"
          className="group/link block"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3 line-clamp-3 drop-shadow-lg group-hover/link:text-white/90 transition-colors">
            {news.title}
          </h2>
        </a>

        {news.summary && (
          <p className="text-white/80 text-sm leading-relaxed line-clamp-2 mb-5 drop-shadow-sm">
            {news.summary}
          </p>
        )}

        {/* Bottom row: source + dots + read button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white/90 text-sm font-semibold">{news.source || "Источник"}</span>
          </div>

          {/* Dot indicators */}
          {total > 1 && (
            <div className="flex items-center gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Слайд ${i + 1}`}
                />
              ))}
            </div>
          )}

          <a
            href={news.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20 hover:bg-white/25 transition-colors backdrop-blur-sm"
          >
            <ExternalLink size={13} />
            Читать
          </a>
        </div>
      </div>

      {/* Progress bar */}
      {!paused && total > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-20">
          <div
            key={current}
            className="h-full bg-white/70"
            style={{ animation: "progressBar 6s linear forwards" }}
          />
        </div>
      )}

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}

/** Regular grid card */
export default function NewsCard({ news }) {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-[#74AA9C]/40 hover:shadow-lg transition-all duration-300"
    >
      {/* Color strip based on first tag */}
      <div className={`h-1 w-full ${(news.tags || []).length > 0 ? "bg-[#74AA9C]" : "bg-slate-200"}`} />

      <div className="flex flex-col flex-1 p-5">
        {/* Source + date row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#74AA9C]" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate max-w-[120px]">
              {news.source || "Источник"}
            </span>
          </div>
          {news.published_at && (
            <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
              <Clock size={11} />
              {formatDate(news.published_at)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 leading-snug mb-2 line-clamp-3 group-hover:text-[#74AA9C] transition-colors duration-200">
          {news.title}
        </h3>

        {/* Summary */}
        {news.summary && (
          <p className="text-xs leading-relaxed text-slate-500 line-clamp-2 mb-3 flex-grow">
            {news.summary}
          </p>
        )}

        {/* Tags */}
        {(news.tags || []).length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
            {(news.tags || []).slice(0, 2).map((tg) => (
              <span key={tg} className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tagColor(tg)}`}>
                {tg}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

/** Compact sidebar card */
export function CompactNewsCard({ news, index }) {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors duration-200"
    >
      {/* Index number */}
      <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center mt-0.5 group-hover:bg-[#74AA9C] group-hover:text-white transition-colors">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#74AA9C] transition-colors">
          {news.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {(news.tags || []).slice(0, 1).map((tg) => (
            <span key={tg} className="text-xs text-[#74AA9C] font-medium">{tg}</span>
          ))}
          {news.published_at && (
            <span className="text-xs text-slate-400">
              {formatDate(news.published_at)}
            </span>
          )}
        </div>
      </div>
      <Eye size={14} className="shrink-0 text-slate-300 group-hover:text-[#74AA9C] transition-colors mt-1" />
    </a>
  );
}
