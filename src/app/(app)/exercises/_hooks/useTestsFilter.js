import { useState, useMemo } from "react";
import { TESTS } from "../_data/exercisesData";

export function useTestsFilter() {
  const [q, setQ] = useState("");
  const [selectedTag, setSelectedTag] = useState("Все");

  const allTestTags = useMemo(() => {
    const s = new Set();
    TESTS.forEach((t) => t.tags.forEach((x) => s.add(x)));
    return ["Все", ...Array.from(s)];
  }, []);

  const filteredTests = useMemo(() => {
    const query = q.trim().toLowerCase();
    return TESTS.filter((t) => {
      const matchesQuery =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some((x) => x.toLowerCase().includes(query));

      const matchesTag = selectedTag === "Все" || t.tags.includes(selectedTag);
      return matchesQuery && matchesTag;
    });
  }, [q, selectedTag]);

  return {
    q,
    setQ,
    selectedTag,
    setSelectedTag,
    allTestTags,
    filteredTests,
  };
}
