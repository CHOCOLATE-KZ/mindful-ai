export default function HowItWorksSection() {
  const steps = [
    { title: "Начать диалог", desc: "Короткий ввод — расскажите, что сейчас важно." },
    { title: "Получить поддержку", desc: "AI предлагает мягкие техники и формулировки для практики." },
    { title: "Записать итоги", desc: "Краткие заметки помогут отслеживать настроение." },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Как это работает</h2>
        <p className="mt-2 text-gray-600">Простой поток — от запроса до мягкого результата.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-lg bg-white/60 p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">{i + 1}</div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
