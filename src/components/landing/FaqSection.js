export default function FaqSection() {
  const faqs = [
    {
      q: "Mindful AI — это настоящий психолог?",
      a: "Нет. Mindful AI — это помощник для поддержки и самопознания, а не лицензированный психолог. Мы можем помочь вам размышлять и развивать здоровые привычки, но мы не заменяем профессиональную помощь. При серьезных проблемах обратитесь к квалифицированному специалисту.",
      icon: "🤖",
    },
    {
      q: "Моя информация конфиденциальна?",
      a: "Да. Мы храним только необходимые данные для работы вашего аккаунта и функций. Все ваши заметки, диалоги и личная информация защищены и не передаются третьим лицам. Полная конфиденциальность — наш приоритет.",
      icon: "🔒",
    },
    {
      q: "Могу ли я удалить свои данные?",
      a: "Полностью. Вы можете удалить любые заметки, очистить историю чатов и даже удалить весь аккаунт целиком. В настройках профиля есть опции экспорта данных перед удалением.",
      icon: "🗑️",
    },
    {
      q: "Как работают дыхательные практики?",
      a: "Наши практики основаны на научных методах, включая диафрагмальное дыхание и 4-7-8 технику. Каждая практика разработана для снижения стресса, улучшения концентрации и регуляции нервной системы. Просто следуйте инструкциям на экране.",
      icon: "🌬️",
    },
    {
      q: "Как часто я должен использовать приложение?",
      a: "Это зависит от ваших целей и расписания. Даже 5-10 минут в день могут принести результаты. Рекомендуем регулярное использование — лучше короткие сеансы каждый день, чем редкие длинные. Слушайте свой организм и адаптируйте график под себя.",
      icon: "📅",
    },
    {
      q: "Какой язык поддерживается?",
      a: "На данный момент приложение полностью доступно на русском языке. Мы планируем добавить поддержку английского и других языков в ближайших обновлениях.",
      icon: "🌐",
    },
    {
      q: "Можно ли использовать без интернета?",
      a: "Большинство функций требуют подключение к интернету для синхронизации. Однако некоторые дыхательные практики и базовые функции работают и без соединения.",
      icon: "📡",
    },
    {
      q: "Безопасен ли ИИ-ассистент?",
      a: "Да. Наш ИИ-ассистент разработан с учетом безопасности и этики. Он не может дать медицинский диагноз или назначить лечение. Все диалоги проходят через систему фильтрации для вашей безопасности.",
      icon: "✅",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      {/* Header */}
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Найдите ответы на популярные вопросы о Mindful AI и его функциях
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-4">
          {faqs.map((f, idx) => (
            <details
              key={idx}
              className="group rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-blue-400 hover:shadow-lg open:border-blue-500 open:bg-gradient-to-br open:from-blue-50 open:to-purple-50"
            >
              <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between font-medium text-gray-900 hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-lg">{f.q}</span>
                </div>
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 transition-all duration-300 group-hover:text-blue-500 group-open:text-blue-600 group-open:rotate-45">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </span>
              </summary>
              <div className="overflow-hidden transition-all duration-300">
                <p className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {f.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
        <h3 className="text-2xl font-bold mb-3">Не нашли ответ?</h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Если у вас есть другие вопросы или вам нужна помощь, свяжитесь с нами через форму обратной связи
        </p>
        <a
          href="/contacts"
          className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
        >
          Связаться с нами
        </a>
      </div>
    </section>
  );
}
