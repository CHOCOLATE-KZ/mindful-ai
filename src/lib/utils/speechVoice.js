const POSITIVE_NAME_WEIGHTS = [
  ["natural", 80],
  ["neural", 70],
  ["online", 50],
  ["microsoft", 45],
  ["google", 35],
  ["svetlana", 35],
  ["irina", 32],
  ["dariya", 28],
  ["katya", 24],
  ["mila", 24],
  ["female", 18],
  ["woman", 18],
];

const NEGATIVE_NAME_WEIGHTS = [
  ["espeak", -80],
  ["eloquence", -60],
  ["desktop", -18],
  ["robot", -35],
  ["compact", -12],
];

function getVoiceScore(voice, lang) {
  const name = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();
  const voiceLang = (voice.lang || "").toLowerCase();
  const normalizedLang = (lang || "ru-RU").toLowerCase();

  let score = 0;

  if (voiceLang === normalizedLang) score += 120;
  else if (voiceLang.startsWith("ru")) score += 90;
  else if (voiceLang.startsWith(normalizedLang.split("-")[0])) score += 65;

  if (voice.default) score += 8;
  if (voice.localService) score += 4;

  for (const [token, weight] of POSITIVE_NAME_WEIGHTS) {
    if (name.includes(token)) score += weight;
  }

  for (const [token, weight] of NEGATIVE_NAME_WEIGHTS) {
    if (name.includes(token)) score += weight;
  }

  return score;
}

export function pickBestSpeechVoice(voices, lang = "ru-RU") {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const sorted = [...voices]
    .map((voice) => ({ voice, score: getVoiceScore(voice, lang) }))
    .sort((left, right) => right.score - left.score);

  return sorted[0]?.voice || null;
}

export function waitForSpeechVoices(timeoutMs = 1500) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }

  const existingVoices = window.speechSynthesis.getVoices();
  if (existingVoices.length > 0) {
    return Promise.resolve(existingVoices);
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (voices) => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      clearTimeout(timer);
      resolve(voices);
    };

    const handleVoicesChanged = () => {
      finish(window.speechSynthesis.getVoices());
    };

    const timer = setTimeout(() => {
      finish(window.speechSynthesis.getVoices());
    }, timeoutMs);

    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
  });
}

export function buildPleasantRussianUtterance(text, voice) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ru-RU";
  utterance.rate = 0.94;
  utterance.pitch = 1.04;
  utterance.volume = 1;

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || "ru-RU";
  }

  return utterance;
}