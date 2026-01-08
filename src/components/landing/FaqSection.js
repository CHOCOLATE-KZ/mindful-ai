import Card from "../ui/Card";

const faqs = [
  { q: "Это замена терапии?", a: "Нет — это инструмент самопомощи и поддержки, не медицинская терапия." },
  { q: "Мои данные приватны?", a: "Все данные остаются в вашем аккаунте; нет публичного доступа." },
  { q: "Нужно ли регистрироваться?", a: "Для персонализированных сессий нужна регистрация, но базовый обзор доступен без неё." },
  { q: "Есть ли ограничение по времени?", a: "Нет жёстких лимитов — сессии короткие и гибкие." },
  { q: "Как работать с тревогой?", a: "Сначала простые дыхательные техники, затем поддерживающие формулировки и заметки." },
  { q: "Можно ли экспортировать заметки?", a: "Сейчас экспорт в разработке; можно копировать вручную." },
];

export default function FaqSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-2xl font-semibold text-gray-900">FAQ</h2>
        <p className="mt-2 text-gray-600">Короткие ответы на частые вопросы.</p>

        <div className="mt-6 grid gap-3">
          {faqs.map((f) => (
            <Card key={f.q} className="p-4">
              <details>
                <summary className="cursor-pointer text-gray-900 font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-gray-600">{f.a}</p>
              </details>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
