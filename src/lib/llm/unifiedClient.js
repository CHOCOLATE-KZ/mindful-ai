const LMSTUDIO_BASE_URL = (process.env.LMSTUDIO_BASE_URL || "http://127.0.0.1:1234").trim();
const LMSTUDIO_MODEL = (process.env.LMSTUDIO_MODEL || "gpt-oss-20b").trim();
const LMSTUDIO_EMBED_MODEL = (process.env.LMSTUDIO_EMBED_MODEL || "text-embedding-nomic-embed-text-v1.5").trim();
const LMSTUDIO_TIMEOUT_MS = Number(process.env.LMSTUDIO_TIMEOUT_MS || 15000);

export async function callUnifiedLlm(messages, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(options.timeoutMs || LMSTUDIO_TIMEOUT_MS));

  try {
    const resp = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: options.model || LMSTUDIO_MODEL,
        messages,
        temperature: Number(options.temperature ?? 0.6),
        max_tokens: Number(options.maxTokens ?? options.max_tokens ?? 512),
        top_p: Number(options.topP ?? 0.9),
        frequency_penalty: Number(options.frequencyPenalty ?? 0.5),
      }),
    });

    const raw = await resp.text();
    if (!resp.ok) {
      return { error: `LM Studio error (${resp.status}): ${raw}` };
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      return { error: `LM Studio returned non-JSON: ${raw}` };
    }

    const reply = (json?.choices?.[0]?.message?.content || "").trim();
    return { reply };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { error: `LM Studio request timeout after ${Number(options.timeoutMs || LMSTUDIO_TIMEOUT_MS)}ms` };
    }
    return { error: error?.message || String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getUnifiedEmbedding(text, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(options.timeoutMs || LMSTUDIO_TIMEOUT_MS));

  try {
    const response = await fetch(`${LMSTUDIO_BASE_URL}/v1/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: options.model || LMSTUDIO_EMBED_MODEL,
        input: text,
      }),
    });

    if (!response.ok) {
      return { error: `LM Studio embeddings error (${response.status})`, embedding: null };
    }

    const data = await response.json();
    const embedding = data?.data?.[0]?.embedding;
    if (!Array.isArray(embedding) || embedding.length === 0) {
      return { error: "LM Studio returned invalid embedding", embedding: null };
    }

    return { embedding };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { error: `LM Studio embeddings timeout after ${Number(options.timeoutMs || LMSTUDIO_TIMEOUT_MS)}ms`, embedding: null };
    }
    return { error: error?.message || String(error), embedding: null };
  } finally {
    clearTimeout(timeout);
  }
}

export const unifiedLlmConfig = {
  baseUrl: LMSTUDIO_BASE_URL,
  model: LMSTUDIO_MODEL,
  embedModel: LMSTUDIO_EMBED_MODEL,
  timeoutMs: LMSTUDIO_TIMEOUT_MS,
};
