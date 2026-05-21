/** Единая модель LM Studio для chat/completions (чат, summary, режимы, отчёты). */
export const DEFAULT_LMSTUDIO_MODEL = "meta-llama-3.1-8b-instruct";

/** Целевой лимит промпта чата (токены); фактически min(это, n_ctx модели). */
export const DEFAULT_CHAT_MAX_CONTEXT_TOKENS = 6000;

/** Embeddings для RAG (отдельная embedding-модель в LM Studio). */
export const DEFAULT_LMSTUDIO_EMBED_MODEL = "text-embedding-nomic-embed-text-v1.5";

export function resolveLmStudioModel(explicit) {
  const value = (explicit || process.env.LMSTUDIO_MODEL || DEFAULT_LMSTUDIO_MODEL).trim();
  return value || DEFAULT_LMSTUDIO_MODEL;
}

export function resolveLmStudioEmbedModel(explicit) {
  const value = (explicit || process.env.LMSTUDIO_EMBED_MODEL || DEFAULT_LMSTUDIO_EMBED_MODEL).trim();
  return value || DEFAULT_LMSTUDIO_EMBED_MODEL;
}
