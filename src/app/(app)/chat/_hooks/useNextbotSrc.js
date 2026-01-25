"use client";
import { useMemo } from "react";

export function useNextbotSrc() {
  return useMemo(() => {
    const base = "https://app.nextbot.kz/chatWidgetIframe/chatWidgetIframe.html";

    const questionButtons = [
      { text: "Как вы себя чувствуете прямо сейчас?", id: "q1" },
      { text: "Хотите поделиться недавними переживаниями или мыслями?", id: "q2" },
      { text: "Хотите получить небольшие советы по управлению эмоциями или стрессом?", id: "q3" },
    ];

    const params = new URLSearchParams({
      agentId: "6a7a61c6-8aaf-458e-bf62-d83fbe4e7363",
      lang: "ru-RU",

      startMessage: "Привет! Я Роза. Я рядом — можем спокойно поговорить. Что сейчас у вас на душе?",
      inputTextPlaceholder: "Напишите, что чувствуете…",
      botIsTypingMessage: "Роза печатает…",

      width: "100",
      height: "620",
      padding: "0",
      borderRadius: "24",

      chatWindowBgColor: "#FFFFFF",
      messageBotBgColor: "#FFFFFF",
      messageBotTextColor: "#111827",
      messageUserBgColor: "#F3F4F6",
      messageUserTextColor: "#111827",
      botIsTypingTextColor: "#6B7280",

      avatarLink: "https://www.pngmart.com/files/21/AI-PNG-Picture.png",
      avatarNextbot: "default",

      chatWindowBgImage: "none",
      chatWindowBgImageLink: "",

      fontLinkHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
      fontCss:
        "font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-weight:400;",

      useCustomSendIcon: "true",
      svgRotation: "0",
    });

    params.set("questionButtons", JSON.stringify(questionButtons));
    return `${base}?${params.toString()}`;
  }, []);
}
