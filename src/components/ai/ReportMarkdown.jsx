"use client";

import ReactMarkdown from "react-markdown";

export const reportMdComponents = {
  h1: ({ children }) => (
    <h2 className="mt-4 mb-2 text-base font-bold text-slate-900 first:mt-0">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-sm font-bold text-[#2a4842] first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-3 mb-1 text-sm font-semibold text-slate-800">{children}</h4>
  ),
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  p: ({ children }) => <p className="mb-2 text-sm leading-relaxed text-slate-700">{children}</p>,
  ul: ({ children }) => <ul className="my-2 space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }) => <li className="text-sm leading-relaxed text-slate-700">{children}</li>,
};

export function ReportMarkdown({ text, className = "" }) {
  if (!text?.trim()) return null;
  return (
    <div className={className}>
      <ReactMarkdown components={reportMdComponents}>{text}</ReactMarkdown>
    </div>
  );
}

function ListBlock({ title, items, tone = "slate" }) {
  if (!items?.length) return null;

  const toneClass =
    tone === "accent"
      ? "border-[#d9eeea] bg-[#f0f7f5]"
      : tone === "success"
        ? "border-[#b3ddd6] bg-[#eef8f6]"
        : "border-slate-200 bg-slate-50";

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</h5>
      <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="leading-relaxed">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const PLAN_LABELS = {
  ru: {
    keyFindings: "Ключевые наблюдения",
    likelyDrivers: "Триггеры и темы",
    plan24h: "План на 24 часа",
    plan7d: "План на 7 дней",
    expectedSignals: "Признаки улучшения",
    checkInQuestions: "Вопросы для рефлексии",
  },
};

export function StructuredReportExtras({ structured, language = "ru" }) {
  if (!structured) return null;
  const labels = PLAN_LABELS[language] || PLAN_LABELS.ru;

  const hasLists =
    structured.keyFindings?.length ||
    structured.likelyDrivers?.length ||
    structured.plan24h?.length ||
    structured.plan7d?.length ||
    structured.expectedSignals?.length ||
    structured.checkInQuestions?.length;

  if (!hasLists) return null;

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <ListBlock title={labels.keyFindings} items={structured.keyFindings} tone="accent" />
      <ListBlock title={labels.likelyDrivers} items={structured.likelyDrivers} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ListBlock title={labels.plan24h} items={structured.plan24h} tone="success" />
        <ListBlock title={labels.plan7d} items={structured.plan7d} tone="success" />
      </div>
      <ListBlock title={labels.expectedSignals} items={structured.expectedSignals} tone="accent" />
      <ListBlock title={labels.checkInQuestions} items={structured.checkInQuestions} />
    </div>
  );
}
