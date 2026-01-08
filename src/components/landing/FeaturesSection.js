import Card from "../ui/Card";

const features = [
  { title: "Снижение стресса", desc: "Короткие практики и поддерживающие диалоги для ежедневного применения." },
  { title: "Улучшение сна", desc: "Успокаивающие техники и рекомендации перед сном." },
  { title: "Эмоциональная осознанность", desc: "Упражнения на распознавание и принятие эмоций." },
  { title: "Фокус и продуктивность", desc: "Лёгкие ритуалы концентрации перед работой." },
  { title: "Дневник настроения", desc: "Записи и простые заметки для отслеживания прогресса." },
  { title: "Поддержка режима", desc: "Напоминания и мягкая структура для самопомощи." },
];

export default function FeaturesSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-semibold text-gray-900">Чем помогает</h2>
        <p className="mt-2 text-gray-600">Набор инструментов для поддержания хорошего состояния — просто и ненавязчиво.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="p-5">
              <h3 className="text-lg font-medium text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
