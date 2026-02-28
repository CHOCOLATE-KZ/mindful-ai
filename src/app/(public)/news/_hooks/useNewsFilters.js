import { useState, useEffect } from "react";

export function useNewsFilters() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("latest");

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  return {
    q,
    setQ,
    debouncedQ,
    tag,
    setTag,
    sort,
    setSort,
  };
}
