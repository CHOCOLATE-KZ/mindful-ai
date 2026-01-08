import Footer from "../../../components/landing/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900">О проекте</h1>
        <p className="mt-4 text-gray-600">Mindful AI — это проект, цель которого помочь людям заботиться о себе с помощью простых практик и поддерживающих диалогов.</p>

        <section className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Концепция</h2>
            <p className="mt-2 text-gray-600">Мы предлагаем краткие и структурированные подходы для самоосознания: дыхательные практики, заметки о настроении и спокойные диалоги.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">Безопасность</h2>
            <p className="mt-2 text-gray-600">Данные принадлежат вам. Система не заменяет профессиональную терапию.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">Команда</h2>
            <p className="mt-2 text-gray-600">Небольшая команда разработчиков и исследователей, фокус на приватности и доступности.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
