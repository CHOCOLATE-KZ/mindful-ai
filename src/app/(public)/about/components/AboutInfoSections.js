import { Heart, ShieldCheck, Accessibility, Sprout, HandHeart, BookOpen, Users, Target, AlertTriangle } from "lucide-react";

export function ValuesSection() {
  const values = [
    {
      icon: <Heart className="h-5 w-5 text-rose-300" />,
      title: "Забота",
      text: "Мы ставим благополучие пользователя в центр каждого продуктового решения.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-300" />,
      title: "Приватность",
      text: "Личные данные защищены и используются только для улучшения вашего опыта.",
    },
    {
      icon: <Accessibility className="h-5 w-5 text-blue-300" />,
      title: "Доступность",
      text: "Платформа должна быть понятной, удобной и доступной для разных пользователей.",
    },
    {
      icon: <Sprout className="h-5 w-5 text-lime-300" />,
      title: "Персонализация",
      text: "Каждый путь уникален, поэтому рекомендации адаптируются под ваш ритм.",
    },
    {
      icon: <HandHeart className="h-5 w-5 text-fuchsia-300" />,
      title: "Поддержка",
      text: "Развиваем дружелюбную среду, где вы можете получить помощь без осуждения.",
    },
    {
      icon: <BookOpen className="h-5 w-5 text-blue-300" />,
      title: "Образование",
      text: "Делимся практическими знаниями о психологии и эмоциональной саморегуляции.",
    },
  ];

  return (
    <section className="mt-16 rounded-3xl bg-slate-900 p-8 text-white sm:p-10">
      <h2 className="text-center text-3xl font-bold sm:text-4xl">Наши ценности</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <article key={value.title}>
            <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold">
              <span>{value.icon}</span>
              {value.title}
            </h3>
            <p className="text-slate-300">{value.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TeamVisionSection() {
  return (
    <section className="mt-16 grid gap-6 lg:grid-cols-2">
      <article className="rounded-2xl border border-blue-200 bg-blue-50 p-8">
        <h3 className="text-2xl font-semibold text-slate-900 inline-flex items-center gap-2"><Users className="h-6 w-6 text-blue-600" /> Команда</h3>
        <p className="mt-4 text-slate-700">
          Мы — команда разработчиков, дизайнеров и исследователей, которые создают
          инструменты для устойчивой эмоциональной поддержки.
        </p>
      </article>

      <article className="rounded-2xl border border-slate-300 bg-white p-8">
        <h3 className="text-2xl font-semibold text-slate-900 inline-flex items-center gap-2"><Target className="h-6 w-6 text-slate-700" /> Видение</h3>
        <p className="mt-4 text-slate-700">
          Наша цель — сделать качественные практики ментального здоровья доступными
          каждому человеку, в удобном и бережном формате.
        </p>
      </article>
    </section>
  );
}

export function ImportantNoticeSection() {
  return (
    <section className="mt-16 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-amber-900 inline-flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Важное примечание</h3>
      <p className="mt-3 text-amber-800">
        Mindful AI — это инструмент для поддержки и самопознания, но он
        <strong> не заменяет профессиональную психологическую помощь</strong>.
        При серьёзных трудностях с психическим здоровьем обратитесь к
        квалифицированному специалисту.
      </p>
    </section>
  );
}