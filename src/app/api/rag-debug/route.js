/**
 * GET/POST /api/rag-debug
 * Диагностика RAG: показывает embedding-статус, топ-чанки со score, keyword-fallback
 * и итоговый контекст который попадет в промпт AI.
 *
 * Требует авторизации (cookie-сессия).
 *
 * POST body: { query: string, limit?: number, threshold?: number }
 * GET  query: ?q=текст&limit=3&threshold=0.5
 */

import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").trim();
const OLLAMA_EMBEDDING_MODEL = (process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text").trim();
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 10000);
const ENABLE_PSYCHOLOGY_RAG = (process.env.ENABLE_PSYCHOLOGY_RAG || "true").trim().toLowerCase() !== "false";

// ---------- helpers ----------

async function tryGetEmbedding(text) {
  const t0 = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ model: OLLAMA_EMBEDDING_MODEL, prompt: text }),
    });

    const latencyMs = Date.now() - t0;

    if (!res.ok) {
      return {
        ok: false,
        latencyMs,
        error: `Ollama HTTP ${res.status}`,
        embedding: null,
      };
    }

    const json = await res.json();
    const embedding = Array.isArray(json?.embedding) ? json.embedding : null;

    return {
      ok: Boolean(embedding?.length),
      latencyMs,
      error: embedding ? null : "Ollama returned empty embedding",
      dims: embedding?.length ?? 0,
      embedding,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - t0,
      error: err?.name === "AbortError" ? `Timeout (>${OLLAMA_TIMEOUT_MS}ms)` : err.message,
      embedding: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function semanticSearch(embedding, limit, threshold) {
  const t0 = Date.now();
  const { data, error } = await supabaseAdmin.rpc("search_psychology_knowledge", {
    query_embedding: embedding,
    similarity_threshold: threshold,
    limit_count: limit,
  });

  return {
    latencyMs: Date.now() - t0,
    error: error?.message ?? null,
    chunks: (data || []).map((row) => ({
      title: row.title,
      section: row.section ?? null,
      similarity: row.similarity != null ? +row.similarity.toFixed(4) : null,
      preview: (row.content_chunk || "").slice(0, 300),
    })),
  };
}

async function keywordSearch(query, limit) {
  const t0 = Date.now();
  const words = (query.toLowerCase().match(/\b\w+\b/g) || []).slice(0, 5);

  if (!words.length) {
    return { latencyMs: 0, chunks: [], note: "No keywords extracted" };
  }

  const orFilter = words.map((kw) => `keywords.cs.{${kw}}`).join(",");

  const { data, error } = await supabaseAdmin
    .from("psychology_knowledge")
    .select("title, section, content_chunk, category, keywords")
    .or(orFilter)
    .limit(limit);

  return {
    latencyMs: Date.now() - t0,
    extractedKeywords: words,
    error: error?.message ?? null,
    chunks: (data || []).map((row) => ({
      title: row.title,
      section: row.section ?? null,
      category: row.category ?? null,
      preview: (row.content_chunk || "").slice(0, 300),
    })),
  };
}

async function countKnowledgeRows() {
  const { count, error } = await supabaseAdmin
    .from("psychology_knowledge")
    .select("*", { count: "exact", head: true });

  return { count: count ?? null, error: error?.message ?? null };
}

// ---------- route handler ----------

async function handler(req) {
  // Только для разработки
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  // Auth check
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse query
  let query = "";
  let limit = 5;
  let threshold = 0.4;

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    query = (body?.query || "").toString().trim();
    if (body?.limit != null) limit = Math.min(10, Math.max(1, Number(body.limit)));
    if (body?.threshold != null) threshold = Math.min(1, Math.max(0, Number(body.threshold)));
  } else {
    const url = new URL(req.url);
    query = (url.searchParams.get("q") || "").trim();
    if (url.searchParams.get("limit")) limit = Math.min(10, Math.max(1, Number(url.searchParams.get("limit"))));
    if (url.searchParams.get("threshold")) threshold = Math.min(1, Math.max(0, Number(url.searchParams.get("threshold"))));
  }

  if (!query) {
    return Response.json(
      { error: "Query is required. POST { query: '...' } or GET ?q=..." },
      { status: 400 }
    );
  }

  if (query.length > 1000) {
    return Response.json({ error: "Query too long (max 1000 chars)" }, { status: 400 });
  }

  // Run diagnostics
  const [rowCount, embeddingResult] = await Promise.all([
    countKnowledgeRows(),
    tryGetEmbedding(query),
  ]);

  const semantic = embeddingResult.ok
    ? await semanticSearch(embeddingResult.embedding, limit, threshold)
    : null;

  const keyword = await keywordSearch(query, limit);

  // Rebuild the context string exactly as the chat API would
  let finalContext = "";
  if (embeddingResult.ok && semantic?.chunks?.length) {
    finalContext = "ПСИХОЛОГИЧЕСКАЯ БАЗА ЗНАНИЙ:\n\n";
    for (const c of semantic.chunks) {
      finalContext += `[${c.title}]\n`;
      if (c.section) finalContext += `Раздел: ${c.section}\n`;
      finalContext += `${c.preview}\n\n`;
    }
  } else if (keyword.chunks?.length) {
    finalContext = "ПСИХОЛОГИЧЕСКАЯ БАЗА ЗНАНИЙ:\n\n";
    for (const c of keyword.chunks) {
      finalContext += `[${c.title}]\n`;
      if (c.section) finalContext += `Раздел: ${c.section}\n`;
      finalContext += `${c.preview}\n\n`;
    }
  }

  return Response.json({
    query,
    settings: {
      ragEnabled: ENABLE_PSYCHOLOGY_RAG,
      ollamaUrl: OLLAMA_BASE_URL,
      ollamaModel: OLLAMA_EMBEDDING_MODEL,
      limit,
      threshold,
    },
    table: rowCount,
    embedding: {
      ok: embeddingResult.ok,
      latencyMs: embeddingResult.latencyMs,
      dims: embeddingResult.dims ?? null,
      error: embeddingResult.error,
    },
    semanticSearch: semantic
      ? {
          latencyMs: semantic.latencyMs,
          error: semantic.error,
          total: semantic.chunks.length,
          chunks: semantic.chunks,
        }
      : { skipped: "Embedding failed — semantic search not attempted" },
    keywordFallback: {
      latencyMs: keyword.latencyMs,
      extractedKeywords: keyword.extractedKeywords,
      error: keyword.error,
      total: keyword.chunks.length,
      chunks: keyword.chunks,
    },
    finalContext: {
      chars: finalContext.length,
      source: embeddingResult.ok && semantic?.chunks?.length
        ? "semantic"
        : keyword.chunks?.length
        ? "keyword-fallback"
        : "empty",
      preview: finalContext.slice(0, 500) || null,
    },
  });
}

export const GET = handler;
export const POST = handler;
