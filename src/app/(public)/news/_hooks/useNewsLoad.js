import { useState, useEffect, useMemo } from "react";

export function useNewsLoad({ debouncedQ, tag, sort }) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, tag, sort]);

  // Build API URL
  const url = useMemo(() => {
    const sp = new URLSearchParams();
    if (debouncedQ) sp.set("q", debouncedQ);
    if (tag) sp.set("tag", tag);
    sp.set("sort", sort);
    sp.set("limit", "20");
    sp.set("page", String(page));
    return `/api/news?${sp.toString()}`;
  }, [debouncedQ, tag, sort, page]);

  // Load data
  useEffect(() => {
    const controller = new AbortController();
    const isFirst = page === 1;
    let mounted = true;

    (async () => {
      if (isFirst) setLoading(true);
      else setLoadingMore(true);

      setErr("");

      try {
        const res = await fetch(url, { cache: "no-store", signal: controller.signal });
        const data = await res.json().catch(() => ({ items: [], error: "Bad JSON" }));
        if (!mounted) return;
        
        if (data?.error) setErr(data.error);

        const got = Array.isArray(data.items) ? data.items : [];
        setTotalCount(Number(data.totalCount || 0));
        setHasMore(Boolean(data.hasMore));

        if (isFirst) setItems(got);
        else setItems((prev) => [...prev, ...got]);
      } catch (e) {
        if (!mounted) return;
        if (e?.name !== "AbortError") setErr(e?.message || String(e));
      } finally {
        if (mounted) {
          if (isFirst) setLoading(false);
          else setLoadingMore(false);
        }
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [url, page]);

  const loadMore = () => {
    if (!hasMore || loading || loadingMore) return;
    setPage((p) => p + 1);
  };

  return {
    items,
    loading,
    loadingMore,
    err,
    totalCount,
    hasMore,
    loadMore,
  };
}
