/**
 * Бюджет контекста LM Studio: сжатие через приоритеты, без рваных обрезок реплик пользователя.
 * CHAT_MAX_CONTEXT_TOKENS — цель (6000), LMSTUDIO_CONTEXT_TOKENS — n_ctx модели (часто 4096).
 */

const DEFAULT_CHAT_MAX_CONTEXT_TOKENS = 6000;
const DEFAULT_LMSTUDIO_CONTEXT_TOKENS = 4096;
const DEFAULT_RESERVE_OUTPUT_TOKENS = 512;
const MESSAGE_OVERHEAD_TOKENS = 4;

const OPTIONAL_SYSTEM_MARKERS = [
  "ВАЖНО: Не повторяй",
  "Ответь точно на тему",
  "Пользователь уточняет",
  "Пользователь дал конкретный",
  "Не выводи статистику",
  "Пользователь поздоровался",
  "Пользователь просто поздоровался",
  "Пользователь сообщает, что у него все хорошо",
  "Пользователь тебя поблагодарил",
];

function readPositiveInt(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

export function getChatContextLimits() {
  const maxContext = readPositiveInt("CHAT_MAX_CONTEXT_TOKENS", DEFAULT_CHAT_MAX_CONTEXT_TOKENS);
  const modelContext = readPositiveInt("LMSTUDIO_CONTEXT_TOKENS", DEFAULT_LMSTUDIO_CONTEXT_TOKENS);
  const reserveOutput = readPositiveInt(
    "CHAT_RESERVE_OUTPUT_TOKENS",
    readPositiveInt("LMSTUDIO_MAX_TOKENS", DEFAULT_RESERVE_OUTPUT_TOKENS)
  );
  const effectiveContext = Math.min(maxContext, modelContext);
  const maxPromptTokens = Math.max(512, effectiveContext - reserveOutput);

  return { maxContext, modelContext, reserveOutput, effectiveContext, maxPromptTokens };
}

export function estimateTokens(text) {
  const len = String(text || "").length;
  if (!len) return 0;
  return Math.ceil(len / 3.2);
}

export function estimateMessagesTokens(messages) {
  if (!Array.isArray(messages)) return 0;
  return messages.reduce(
    (sum, m) => sum + MESSAGE_OVERHEAD_TOKENS + estimateTokens(m?.content),
    0
  );
}

export function isContextOverflowError(errorText) {
  const t = String(errorText || "").toLowerCase();
  return (
    t.includes("n_keep") ||
    t.includes("n_ctx") ||
    t.includes("context length") ||
    t.includes("context window") ||
    t.includes("maximum context") ||
    t.includes("too many tokens") ||
    t.includes("reduce the length")
  );
}

function cloneMessages(messages) {
  return (Array.isArray(messages) ? messages : []).map((m) => ({
    role: m?.role === "assistant" ? "assistant" : m?.role === "system" ? "system" : "user",
    content: String(m?.content || ""),
  }));
}

function isRagSystemMessage(content) {
  const c = String(content || "");
  return c.includes("PROFESSIONAL KNOWLEDGE BASE") || c.includes("ПСИХОЛОГИЧЕСКАЯ БАЗА");
}

function isSummaryOrBridgeMessage(content) {
  const c = String(content || "");
  return c.startsWith("РЕЗЮМЕ ПРЕДЫДУЩЕЙ") || c.startsWith("СООБЩЕНИЯ МЕЖДУ РЕЗЮМЕ");
}

function isOptionalSystemMessage(content, index) {
  if (index === 0) return false;
  const c = String(content || "");
  if (isRagSystemMessage(c) || isSummaryOrBridgeMessage(c)) return false;
  if (c.includes("КРИЗИС") || c.includes("суицид") || c.includes("продолжить")) return false;
  return OPTIONAL_SYSTEM_MARKERS.some((m) => c.includes(m));
}

function findHistoryRange(messages) {
  let start = -1;
  let end = -1;
  for (let i = 0; i < messages.length - 1; i++) {
    const role = messages[i]?.role;
    if (role === "user" || role === "assistant") {
      if (start < 0) start = i;
      end = i;
    }
  }
  return { start, end };
}

/**
 * @param {"normal" | "aggressive"} level
 */
export function compressMessagesToBudget(messages, maxPromptTokens, level = "normal") {
  const budget = Number(maxPromptTokens) > 0 ? maxPromptTokens : getChatContextLimits().maxPromptTokens;
  const copy = cloneMessages(messages);
  const steps = [];

  let tokens = estimateMessagesTokens(copy);
  if (tokens <= budget) {
    return { messages: copy, trimmed: false, estimatedTokens: tokens, maxPromptTokens: budget, steps };
  }

  if (level === "aggressive") {
    for (let i = copy.length - 2; i >= 1; i--) {
      if (copy[i].role === "system" && isRagSystemMessage(copy[i].content)) {
        copy.splice(i, 1);
        steps.push("drop_rag");
        break;
      }
    }
    tokens = estimateMessagesTokens(copy);
  }

  for (let i = copy.length - 2; i >= 1 && tokens > budget; i--) {
    if (copy[i].role === "system" && isOptionalSystemMessage(copy[i].content, i)) {
      copy.splice(i, 1);
      steps.push("drop_optional_system");
      tokens = estimateMessagesTokens(copy);
    }
  }

  let { start: historyStart, end: historyEnd } = findHistoryRange(copy);
  const minRecentTurns = level === "aggressive" ? 4 : 6;

  while (tokens > budget && historyStart >= 0 && historyEnd - historyStart + 1 > minRecentTurns) {
    copy.splice(historyStart, 1);
    historyEnd -= 1;
    steps.push("drop_oldest_turn");
    tokens = estimateMessagesTokens(copy);
    ({ start: historyStart, end: historyEnd } = findHistoryRange(copy));
  }

  if (level === "aggressive") {
    for (let i = copy.length - 2; i >= 1 && tokens > budget; i--) {
      if (copy[i].role === "system" && isSummaryOrBridgeMessage(copy[i].content)) {
        const c = copy[i].content;
        if (c.startsWith("СООБЩЕНИЯ МЕЖДУ РЕЗЮМЕ")) {
          copy.splice(i, 1);
          steps.push("drop_bridge");
          tokens = estimateMessagesTokens(copy);
        }
      }
    }
  }

  for (let i = 0; i < copy.length - 1 && tokens > budget; i++) {
    if (!isRagSystemMessage(copy[i].content)) continue;
    const maxRagChars = level === "aggressive" ? 600 : 1200;
    if (copy[i].content.length > maxRagChars) {
      copy[i].content = `${copy[i].content.slice(0, maxRagChars)}\n[…фрагмент базы знаний сокращён для лимита контекста]`;
      steps.push("shrink_rag");
      tokens = estimateMessagesTokens(copy);
    }
  }

  for (let i = 0; i < copy.length - 1 && tokens > budget; i++) {
    if (copy[i].role !== "system" || !isSummaryOrBridgeMessage(copy[i].content)) continue;
    const maxLen = level === "aggressive" ? 500 : 900;
    if (copy[i].content.length > maxLen) {
      copy[i].content = `${copy[i].content.slice(0, maxLen)}…`;
      steps.push("shrink_summary");
      tokens = estimateMessagesTokens(copy);
    }
  }

  return {
    messages: copy,
    trimmed: steps.length > 0,
    estimatedTokens: tokens,
    maxPromptTokens: budget,
    steps,
    withinBudget: tokens <= budget,
  };
}

export function applyContextBudget(messages) {
  const { maxPromptTokens } = getChatContextLimits();
  return compressMessagesToBudget(messages, maxPromptTokens, "normal");
}

export function applyAggressiveContextBudget(messages) {
  const { maxPromptTokens } = getChatContextLimits();
  return compressMessagesToBudget(messages, maxPromptTokens, "aggressive");
}
