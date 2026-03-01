import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleCheck, Quote } from "lucide-react";

export function WelcomeSection() {
  const points = [
    "Короткие практики, которые легко встроить в день",
    "Поддерживающие AI-диалоги без оценки",
    "Понятная динамика состояния и прогресса",
    "Фокус на приватности и безопасности данных",
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Цифровая поддержка, которая помогает чувствовать себя стабильнее
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            Mindful AI объединяет доказательные подходы психологии и удобный
            формат ежедневной практики.
          </p>

          <ul className="mt-6 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-slate-700">
                <CircleCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/exercises"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Перейти к упражнениям
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
            <Image
              src="/faq-illustration.png"
              alt="Mindful AI section"
              width={900}
              height={560}
              className="h-64 w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="text-2xl font-bold text-indigo-700">30+</p>
              <p className="mt-1">психологических фактов и практик</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="text-2xl font-bold text-indigo-700">24/7</p>
              <p className="mt-1">доступ к поддерживающему ассистенту</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  const services = [
    {
      title: "Ежедневные практики",
      text: "Дыхание, grounding, упражнения на осознанность в коротком формате.",
      featured: false,
    },
    {
      title: "AI-поддержка",
      text: "Диалоговый помощник, который помогает структурировать мысли и эмоции.",
      featured: true,
    },
    {
      title: "Трекинг состояния",
      text: "Отслеживайте настроение и замечайте динамику своего состояния.",
      featured: false,
    },
  ];

  return (
    <section className="rounded-3xl bg-slate-100 px-6 py-14 sm:px-10 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Что внутри платформы</h2>
        <p className="mt-3 text-lg text-slate-600">
          Ключевые функции, которые поддерживают ваше эмоциональное благополучие.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.title}
            className={`rounded-2xl border bg-white p-6 shadow-sm transition-all ${
              service.featured
                ? "border-indigo-300 ring-1 ring-indigo-300"
                : "border-slate-200"
            }`}
          >
            <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
            <p className="mt-3 text-slate-600">{service.text}</p>
            <Link
              href="/auth/login"
              className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-colors ${
                service.featured
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-700"
              }`}
            >
              Попробовать
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Алия Ж.",
      role: "Студентка",
      text: "Платформа помогает быстро вернуться в спокойное состояние перед сессиями.",
    },
    {
      name: "Ерлан К.",
      role: "Product Designer",
      text: "Нравится мягкий тон ассистента и наглядный трекинг прогресса по дням.",
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Что говорят пользователи
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Мы развиваем Mindful AI вместе с пользователями и регулярно улучшаем
            опыт на основе обратной связи.
          </p>
        </div>

        <div className="grid gap-4">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Quote className="h-5 w-5 text-indigo-600" />
              <p className="mt-3 text-slate-700">{item.text}</p>
              <p className="mt-4 font-semibold text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-500">{item.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsSection() {
  const stories = [
    {
      title: "Как формировать устойчивые привычки без перегруза",
      text: "Подход небольших шагов и регулярности помогает закрепить изменения.",
    },
    {
      title: "Почему дыхание работает в стрессовых ситуациях",
      text: "Короткие циклы дыхания снижают физическое напряжение и тревожность.",
    },
    {
      title: "Как вести дневник эмоций с пользой",
      text: "Фиксация чувств и триггеров улучшает самопонимание и саморегуляцию.",
    },
  ];

  return (
    <section className="pb-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Материалы и инсайты</h2>
          <p className="mt-3 text-lg text-slate-600">
            Подборка коротких материалов о ментальном здоровье и практиках.
          </p>
        </div>
        <Link
          href="/psychology"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-700"
        >
          Смотреть всё
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Image
            src="/faq-illustration.png"
            alt={stories[0].title}
            width={1200}
            height={760}
            className="h-64 w-full object-cover"
          />
          <div className="p-5">
            <h3 className="text-xl font-semibold text-slate-900">{stories[0].title}</h3>
            <p className="mt-2 text-slate-600">{stories[0].text}</p>
          </div>
        </article>

        <div className="grid gap-6">
          {stories.slice(1).map((story) => (
            <article
              key={story.title}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Image
                src="/faq-illustration.png"
                alt={story.title}
                width={900}
                height={520}
                className="h-36 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-slate-900">{story.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{story.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}