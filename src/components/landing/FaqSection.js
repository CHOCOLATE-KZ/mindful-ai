"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  HeartHandshake,
  LockKeyhole,
  NotebookPen,
} from "lucide-react";
import SectionLabel from "@/components/landing/SectionLabel";

function CategoryCard({ item, active, onClick }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
        active
          ? "border-[#74AA9C]/45 shadow-md"
          : "border-black/10 hover:-translate-y-0.5 hover:border-[#74AA9C]/25 hover:shadow-md"
      }`}
    >
      <div className={`h-36 px-6 py-5 ${item.surface}`}>
        <div className="flex h-full items-end justify-between">
          <div className="max-w-[70%]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
              {item.kicker}
            </div>
            <div className="mt-2 text-xl font-semibold leading-tight text-black">
              {item.title}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
            <Icon className="h-6 w-6 text-[#5d9088]" />
          </div>
        </div>
      </div>
      <div className="border-t border-black/8 bg-white px-5 py-4">
        <div className="text-sm text-black/60">{item.description}</div>
      </div>
    </button>
  );
}

function ArticleCard({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="group rounded-2xl border border-transparent py-1 transition hover:border-[#74AA9C]/15 hover:bg-[#f7fbf9]/80 hover:px-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center text-[#5d9088]">
          <item.icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-semibold leading-snug text-[#10211f] transition-colors group-hover:text-[#5d9088]">
            {item.q}
          </h3>
          <p
            className={`mt-2 text-sm leading-relaxed text-black/55 ${open ? "" : "line-clamp-2"}`}
          >
            {item.a}
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#5d9088] transition-colors hover:text-[#74AA9C]"
          >
            {open ? "Свернуть" : "Подробнее"}
            <ArrowRight
              className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState("support");

  const categories = [
    {
      key: "support",
      kicker: "Поддержка",
      title: "Поддержка и границы ИИ",
      description: "Что умеет MindfulAI и в каких рамках он работает.",
      icon: HeartHandshake,
      surface: "bg-[linear-gradient(135deg,#dff4ec,#f8fbfa)]",
    },
    {
      key: "trust",
      kicker: "Приватность",
      title: "Конфиденциальность и безопасность",
      description: "Как хранятся данные и что можно удалить.",
      icon: LockKeyhole,
      surface: "bg-[linear-gradient(135deg,#eef7ff,#f9fbff)]",
    },
    {
      key: "practice",
      kicker: "Практики",
      title: "Дневник и практики",
      description: "Как получать пользу от заметок и упражнений.",
      icon: NotebookPen,
      surface: "bg-[linear-gradient(135deg,#f7f2ff,#fcfaff)]",
    },
    {
      key: "product",
      kicker: "Сервис",
      title: "Как устроен сервис",
      description: "Язык, доступность и повседневное использование.",
      icon: Brain,
      surface: "bg-[linear-gradient(135deg,#fff5ea,#fffaf5)]",
    },
  ];

  const articles = useMemo(() => [
    {
      category: "support",
      icon: HeartHandshake,
      q: "MindfulAI — это настоящий психолог?",
      a: "Нет. Это цифровой помощник для поддержки и саморефлексии. Он помогает структурировать мысли, вести дневник и использовать простые практики, но не заменяет лицензированного специалиста.",
    },
    {
      category: "support",
      icon: HeartHandshake,
      q: "Безопасен ли ИИ-ассистент?",
      a: "Ассистент работает в безопасных рамках: не ставит диагнозы, не назначает лечение и не выдает себя за врача. Его роль — поддержка, навигация и помощь в самоанализе.",
    },
    {
      category: "support",
      icon: HeartHandshake,
      q: "Что делать, если мне нужна срочная помощь?",
      a: "MindfulAI не предназначен для кризисных ситуаций. Если пользователь находится в состоянии острого риска, ему важно немедленно обратиться к живому специалисту, экстренным службам или доверенному взрослому.",
    },
    {
      category: "trust",
      icon: LockKeyhole,
      q: "Моя информация конфиденциальна?",
      a: "Да. Хранятся только данные, необходимые для работы сервиса. Личные записи, ответы и история использования не должны использоваться вне контекста приложения.",
    },
    {
      category: "trust",
      icon: LockKeyhole,
      q: "Могу ли я удалить свои данные?",
      a: "Да. Пользователь должен иметь возможность удалить заметки, отдельные записи, историю чата и при необходимости сам аккаунт. Это важно для доверия к продукту.",
    },
    {
      category: "trust",
      icon: LockKeyhole,
      q: "Кто может видеть мои записи и заметки?",
      a: "Дневник и персональные заметки должны быть доступны только самому пользователю в рамках его аккаунта. Это ключевая часть доверия и приватности в продукте психологической поддержки.",
    },
    {
      category: "practice",
      icon: NotebookPen,
      q: "Как работают дыхательные практики?",
      a: "Практики основаны на простых техниках саморегуляции. Они помогают снизить напряжение, замедлить дыхание и вернуть внимание в тело, когда человек чувствует перегрузку или тревогу.",
    },
    {
      category: "practice",
      icon: NotebookPen,
      q: "Как часто использовать приложение?",
      a: "Оптимальный формат — короткие регулярные сессии. Даже 5–10 минут в день дают больше пользы, чем редкое, но длинное использование.",
    },
    {
      category: "practice",
      icon: NotebookPen,
      q: "Зачем вести дневник настроения?",
      a: "Дневник помогает заметить повторяющиеся триггеры, изменения настроения и связь между событиями, мыслями и реакциями. Это делает самонаблюдение более осознанным и полезным.",
    },
    {
      category: "product",
      icon: Brain,
      q: "Какой язык поддерживается?",
      a: "Сейчас основной язык интерфейса — русский. В будущем сервис можно расширять на другие языки, не меняя основную логику продукта.",
    },
    {
      category: "product",
      icon: Brain,
      q: "Можно ли использовать без интернета?",
      a: "Часть интерфейса и заранее загруженные материалы могут быть доступны локально, но для синхронизации, аналитики и ИИ-функций требуется подключение к сети.",
    },
    {
      category: "product",
      icon: Brain,
      q: "Подойдет ли сервис для ежедневного использования?",
      a: "Да. Логика продукта строится вокруг коротких, регулярных действий: чек-ин настроения, заметка, небольшая практика или разговор с ассистентом. Это помогает встроить сервис в повседневную жизнь.",
    },
  ], []);

  const visibleArticles = useMemo(
    () => articles.filter((item) => item.category === activeCategory),
    [activeCategory, articles]
  );

  return (
    <section id="faq" className="mx-auto max-w-7xl bg-white px-6 py-16 md:py-20">
      <div>
        <SectionLabel>Частые вопросы</SectionLabel>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#10211f] sm:text-4xl">
          Чем мы можем помочь?
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-black/60">
          Собрали самые важные ответы о MindfulAI: как работает ассистент, что с конфиденциальностью и как использовать сервис с пользой.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((item) => (
          <CategoryCard
            key={item.key}
            item={item}
            active={activeCategory === item.key}
            onClick={() => setActiveCategory(item.key)}
          />
        ))}
      </div>

      <div className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-black">Популярные вопросы</h3>
            <p className="mt-1 text-sm text-black/55">
              Короткие ответы на вопросы, которые чаще всего возникают у пользователя.
            </p>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-8 border-t border-black/8 pt-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleArticles.map((item, index) => (
            <ArticleCard key={`${item.q}-${index}`} item={item} />
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-3xl border border-black/8 bg-[#f7fbf9] px-6 py-10 text-center sm:px-10">
        <h3 className="text-2xl font-semibold text-black">Не нашли нужный ответ?</h3>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-black/60">
          Напиши нам или открой полный раздел FAQ — там ещё больше ответов о сервисе.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contacts"
            className="inline-flex items-center justify-center rounded-full bg-[#74AA9C] px-6 py-3 font-semibold text-white transition hover:bg-[#5d9088]"
          >
            Связаться с нами
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 font-semibold text-black/75 transition hover:border-[#74AA9C]/30 hover:text-[#5d9088]"
          >
            Все вопросы
          </Link>
        </div>
      </div>
    </section>
  );
}