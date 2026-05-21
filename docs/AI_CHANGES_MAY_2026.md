# MindfulAI: AI Changes Summary (May 2026)

## Purpose

This file is a handoff summary for diploma writing. It reflects the current AI implementation in code (as of May 2026).

## What changed in AI architecture

1. The chat endpoint is now a full AI pipeline, not just a raw LM call.
2. The model response is controlled by 3 dynamic modes:
   - LISTENING: empathic reflection, minimal advice
   - ANALYSIS: explain psychological mechanism
   - GUIDANCE: concrete actionable steps
3. Safety logic is now explicit and multi-layered:
   - hard-block patterns for harmful/illegal intent
   - therapeutic context override (to avoid blocking users asking for recovery help)
   - crisis trigger detection (self-harm/suicidal signals)
   - post-generation validation and sanitization
4. RAG is integrated into chat with fallback strategy:
   - primary: embeddings + semantic search via Supabase RPC
   - fallback: keyword search when embeddings are unavailable
5. Personalization is privacy-aware:
   - controlled by user settings (`ai_personalization`, `data_sharing_ai`)
   - uses profile + recent notes + limited chat history when consent is enabled
6. AI profile/weekly reports were expanded:
   - structured JSON output
   - derived indices (`riskIndex`, `resourceIndex`, confidence)
   - trend and signal extraction from notes/chats/tests

## Current core AI routes

- `POST /api/chat`
  - Main conversational AI route
  - Intent routing + mode selection + RAG + safeguards
- `POST /api/ai/profile-report`
  - Generates profile or weekly report
  - Uses notes, tests, and chat history
- `GET /api/ai/profile-report`
  - Returns report history
- `GET /api/rag-debug`
  - Debug route for retrieval quality
- `POST /api/notes/analyze`
  - AI analysis for diary note batches

## Current model and retrieval stack

- Primary inference backend: LM Studio (OpenAI-compatible API)
- Default chat model: `meta-llama-3.1-8b-instruct`
- Embedding model: `text-embedding-nomic-embed-text-v1.5`
- Retrieval data source: `psychology_knowledge` table + markdown source files in `psychology_knowledge/`

## Environment variables used by AI

- `LMSTUDIO_BASE_URL`
- `LMSTUDIO_MODEL`
- `LMSTUDIO_TIMEOUT_MS`
- `LMSTUDIO_TEMPERATURE`
- `LM_MODE_LISTENING_TEMPERATURE`
- `LM_MODE_LISTENING_MAX_TOKENS`
- `LM_MODE_ANALYSIS_TEMPERATURE`
- `LM_MODE_ANALYSIS_MAX_TOKENS`
- `LM_MODE_GUIDANCE_TEMPERATURE`
- `LM_MODE_GUIDANCE_MAX_TOKENS`
- `ENABLE_PSYCHOLOGY_RAG`
- `RAG_LIMIT`
- `RAG_MIN_QUERY_LENGTH`
- `LMSTUDIO_EMBED_MODEL`

Optional (alternative provider):

## Database entities relevant to AI

- `ai_messages` (chat history)
- `notes` (diary inputs)
- `tests_log` (psychological test history)
- `ai_reports` (generated reports)
- `psychology_knowledge` (retrieval chunks)
- `user_settings` (privacy/personalization controls)

## Recommended wording for diploma text

Use this phrasing to match implementation:

"The MindfulAI system uses a local LLM pipeline with intent-aware response modes, retrieval-augmented context injection, and multi-layer safety checks (pre-LLM filtering, crisis detection, and post-generation validation). The personalization layer is consent-aware and can be disabled through user privacy settings."

## Implementation notes and limitations

1. The primary runtime path is LM Studio (`meta-llama-3.1-8b-instruct` for chat, nomic embed for RAG).
2. Retrieval quality depends on `psychology_knowledge` data completeness and embedding availability.
3. Safety filters reduce harmful outputs but do not replace human clinical supervision.
4. The system is a support assistant and does not provide medical diagnosis.
