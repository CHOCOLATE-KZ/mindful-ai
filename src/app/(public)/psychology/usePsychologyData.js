import { useMemo } from "react";
import { psychologyFacts } from "@/data/psychologyFacts";
import {
  psychologyVideos,
  featuredVideoId,
} from "@/data/psychologyMedia";
import { ALL_CATEGORY } from "./constants";

export function useFilteredFacts(selectedCategory, searchQuery) {
  return useMemo(() => {
    let facts = psychologyFacts;

    if (selectedCategory !== ALL_CATEGORY) {
      facts = facts.filter((fact) => fact.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      facts = facts.filter(
        (fact) =>
          fact.title.toLowerCase().includes(query) ||
          fact.fact.toLowerCase().includes(query) ||
          fact.category.toLowerCase().includes(query)
      );
    }

    return facts;
  }, [selectedCategory, searchQuery]);
}

export function useVideoSelection(selectedVideoCategory) {
  const filteredVideos = useMemo(() => {
    if (selectedVideoCategory === ALL_CATEGORY) {
      return psychologyVideos;
    }

    return psychologyVideos.filter(
      (video) => video.category === selectedVideoCategory
    );
  }, [selectedVideoCategory]);

  const featuredVideo = useMemo(() => {
    const preferredVideo = psychologyVideos.find(
      (video) => video.id === featuredVideoId
    );

    if (selectedVideoCategory === ALL_CATEGORY) {
      return preferredVideo || psychologyVideos[0] || null;
    }

    return filteredVideos[0] || null;
  }, [selectedVideoCategory, filteredVideos]);

  return { filteredVideos, featuredVideo };
}