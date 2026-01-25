"use client";

import { useEffect, useMemo, useRef } from "react";

export default function NextBotWidget() {
  const iframeRef = useRef(null);

  const src = useMemo(() => {
    const base = "https://app.nextbot.kz/chatWidgetIframe/chatWidgetIframe.html";

    // ВАЖНО: questionButtons делаем валидным JSON
    const questionButtons = [
      { text: "Как вы себя чувствуете прямо сейчас?", id: "q1" },
      { text: "Хотите поделиться недавними переживаниями или мыслями?", id: "q2" },
      { text: "Хотите получить небольшие советы по управлению эмоциями или стрессом?", id: "q3" },
    ];

    const params = new URLSearchParams({
      agentId: "6a7a61c6-8aaf-458e-bf62-d83fbe4e7363",
      inputTextPlaceholder: "Ваше сообщение...",
      botIsTypingMessage: "Роза печатает",
      chatWindowBgColor: "#eaf6f8",
      messageBotBgColor: "#5b7eb8",
      messageBotTextColor: "#ffffff",
      messageUserBgColor: "#f5f5f5",
      messageUserTextColor: "#000000",
      borderRadius: "10",
      width: "100",
      height: "500",
      padding: "0",
      startMessage: "Привет! Я Роза 🌱 Я здесь, чтобы поддержать вас. С чего вам хотелось бы начать?",
      botIsTypingTextColor: "#000000",
      avatarLink: "https://www.pngmart.com/files/21/AI-PNG-Picture.png",
      chatWindowBgImage: "bg1",
      chatWindowBgImageLink: "https://rus.nextbot.ru/chatWidgetIframe/img/backgrounds/bg1.png",
      lang: "ru-RU",
      fontLinkHref: "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
      fontCss:
        'font-family:"Roboto", sans-serif;font-optical-sizing:auto;font-weight:400;font-style:normal;font-variation-settings:"wdth" 100;',
      useCustomSendIcon: "true",
      svgRotation: "0",
      // ВАЖНО: кодируем JSON
      questionButtons: JSON.stringify(questionButtons),
      // parentLocationHref добавим уже на клиенте в useEffect
    });

    return `${base}?${params.toString()}`;
  }, []);

  useEffect(() => {
    if (!iframeRef.current) return;
    const url = new URL(src);
    url.searchParams.set("parentLocationHref", window.location.href);
    iframeRef.current.src = url.toString();
  }, [src]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl h-[500px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow">
        <iframe
          ref={iframeRef}
          title="NextBot chatWidget"
          width="100%"
          height="100%"
          style={{ border: "none" }}
          // если виджет умеет postMessage/куки — sandbox может мешать
          // sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}