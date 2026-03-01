"use client";

import { useEffect, useRef } from "react";

/* -------------------- FAQ ITEM -------------------- */
function FaqItem({ f }) {
  const detailsRef = useRef(null);
  const contentRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details || !content) return;

    const summary = details.querySelector("summary");

    // стартовое состояние
    content.style.height = details.open ? "auto" : "0px";
    content.style.opacity = details.open ? "1" : "0";
    content.style.overflow = "hidden";

    const onClick = (e) => {
      e.preventDefault(); // полностью контролируем open/close

      const isOpening = !details.open;

      // отменяем текущую анимацию
      if (animationRef.current) animationRef.current.cancel();

      const startHeight = content.getBoundingClientRect().height;

      if (isOpening) {
        details.open = true; // нужно открыть, чтобы получить scrollHeight
      }

      const endHeight = isOpening ? content.scrollHeight : 0;

      // фиксируем стартовую высоту
      content.style.height = `${startHeight}px`;
      content.style.opacity = isOpening ? "0" : "1";

      // forced reflow — ОБЯЗАТЕЛЬНО
      content.offsetHeight;

      animationRef.current = content.animate(
        [
          { height: `${startHeight}px`, opacity: isOpening ? 0 : 1 },
          { height: `${endHeight}px`, opacity: isOpening ? 1 : 0 },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.25, 0.8, 0.25, 1)",
        }
      );

      animationRef.current.onfinish = () => {
        animationRef.current = null;

        if (isOpening) {
          content.style.height = "auto";
          content.style.opacity = "1";
        } else {
          details.open = false;
          content.style.height = "0px";
          content.style.opacity = "0";
        }
      };
    };

    summary.addEventListener("click", onClick);
    return () => summary.removeEventListener("click", onClick);
  }, []);

  return (
    <details
      ref={detailsRef}
      className="group rounded-lg bg-white border border-blue-100 transition-all duration-300 hover:shadow-md open:border-2 open:border-blue-300"
    >
      <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between font-medium text-black hover:text-[#5479F7] transition-colors">
        <span className="text-base">{f.q}</span>

        <span className="flex-shrink-0 text-blue-400 transition-all duration-300 group-hover:text-[#5479F7] group-open:text-[#5479F7]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </summary>

      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: "0px", opacity: 0 }}
      >
        <p className="px-6 pb-4 text-black leading-relaxed border-t border-blue-200 pt-4">
          {f.a}
        </p>
      </div>
    </details>
  );
}

/* -------------------- FAQ SECTION -------------------- */
export default function FaqSection() {
  const faqs = [
    {
      q: "Mindful AI — это настоящий психолог?",
      a: "Нет. Mindful AI — это помощник для поддержки и самопознания, а не лицензированный психолог. Мы можем помочь вам размышлять и развивать здоровые привычки, но не заменяем профессиональную помощь. При серьёзных проблемах обратитесь к специалисту.",
      icon: "🤖",
    },
    {
      q: "Моя информация конфиденциальна?",
      a: "Да. Мы храним только минимально необходимые данные. Все заметки, диалоги и личная информация защищены и не передаются третьим лицам.",
      icon: "🔒",
    },
    {
      q: "Могу ли я удалить свои данные?",
      a: "Полностью. Вы можете удалить заметки, историю чатов и даже весь аккаунт. Также доступен экспорт данных.",
      icon: "🗑️",
    },
    {
      q: "Как работают дыхательные практики?",
      a: "Практики основаны на научных методах: диафрагмальное дыхание, техника 4-7-8 и другие. Они помогают снизить стресс и стабилизировать нервную систему.",
      icon: "🌬️",
    },
    {
      q: "Как часто использовать приложение?",
      a: "Даже 5–10 минут в день дают эффект. Лучше коротко, но регулярно, чем редко и долго.",
      icon: "📅",
    },
    {
      q: "Какой язык поддерживается?",
      a: "Сейчас приложение полностью на русском языке. В будущем появится английский и другие языки.",
      icon: "🌐",
    },
    {
      q: "Можно ли использовать без интернета?",
      a: "Некоторые функции доступны офлайн, но для синхронизации и ИИ требуется интернет.",
      icon: "📡",
    },
    {
      q: "Безопасен ли ИИ-ассистент?",
      a: "Да. Ассистент не ставит диагнозы и не назначает лечение. Он работает в рамках этических и безопасных ограничений.",
      icon: "✅",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      {/* Header with Image */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-4xl font-bold text-black mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-xl text-black">
            Найдите ответы на популярные вопросы о Mindful AI
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <img 
            src="/faq-illustration.png" 
            alt="FAQ Illustration" 
            className="w-full max-w-sm h-auto rounded-xl shadow-lg"
          />
        </div>
      </div>

      {/* FAQ Grid */}
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((f, i) => (
            <FaqItem key={i} f={f} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-2xl bg-[#5479F7] p-12 text-center text-white">
        <h3 className="text-2xl font-bold mb-3">Не нашли ответ?</h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Свяжитесь с нами, если у вас остались вопросы
        </p>
        <a
          href="/contacts"
          className="inline-block bg-white text-[#5479F7] font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
        >
          Связаться с нами
        </a>
      </div>
    </section>
  );
}
