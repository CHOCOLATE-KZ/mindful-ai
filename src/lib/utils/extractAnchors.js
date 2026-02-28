export function extractAnchors(text) {
  if (!text) return [];

  const boldMatches = Array.from(text.matchAll(/\*\*([^*]{3,50})\*\*/g))
    .map((m) => m[1].trim())
    .filter((s) => s.length > 2 && !s.includes("<") && !s.includes("["));

  const strongMatches = Array.from(text.matchAll(/__([^_]{3,50})__/g))
    .map((m) => m[1].trim())
    .filter((s) => s.length > 2 && !s.includes("<") && !s.includes("["));

  const merged = [...new Set([...boldMatches, ...strongMatches])].slice(0, 3);
  if (merged.length) return merged;

  const sentences = text
    .replace(/\s+/g, " ")
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && !s.includes("<") && !s.includes("["));

  return sentences.slice(0, 3).map((s) => {
    const words = s.split(/\s+/).filter((w) => w.length > 2);
    const max = Math.min(words.length, 5);
    let phrase = words.slice(0, max).join(" ");
    if (phrase.length > 50) {
      phrase = phrase.slice(0, 50).trim();
      if (!phrase.endsWith(" ")) phrase = phrase.slice(0, phrase.lastIndexOf(" "));
    }
    return phrase;
  });
}
