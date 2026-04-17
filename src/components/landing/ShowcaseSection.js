"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Brain, NotebookPen, ShieldCheck } from "lucide-react";

export default function ShowcaseSection() {
  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[radial-gradient(circle_at_14%_86%,rgba(193,245,234,0.56),transparent_38%),radial-gradient(circle_at_86%_90%,rgba(131,191,176,0.56),transparent_34%),linear-gradient(180deg,#0f1e1b_0%,#1a3530_48%,#2f5a51_100%)] py-24 text-white">
      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-[radial-gradient(circle_at_center,rgba(199,249,238,0.42),transparent_62%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 max-w-xl">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9fdfd0]">
            MindfulAI everywhere
          </div>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.45rem] lg:leading-[1.02]">
            Поддержка там, где человеку удобнее всего
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/72 sm:text-lg">
            Веб-интерфейс помогает вести дневник, смотреть аналитику и практики, а Telegram-бот дает быстрый, приватный контакт с MindfulAI в привычном мобильном формате.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-[#11302a] shadow-[0_12px_30px_rgba(255,255,255,0.12)] transition hover:bg-[#eff8f5]"
            >
              Открыть чат
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/10"
            >
              Посмотреть дневник
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <FeaturePill icon={ShieldCheck} text="Приватность" />
            <FeaturePill icon={NotebookPen} text="Дневник и анализ" />
            <FeaturePill icon={Bot} text="Telegram 24/7" />
          </div>
        </div>

        <div className="relative flex min-h-[500px] items-center justify-center lg:min-h-[620px]">
          <DesktopMock />
          <PhoneMock />
        </div>
      </div>
    </section>
  );
}

function FeaturePill({ icon: Icon, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 text-sm font-medium text-white/88">
        <Icon className="h-4 w-4 text-[#9fdfd0]" />
        <span>{text}</span>
      </div>
    </div>
  );
}

function DesktopMock() {
  return (
    <div className="pointer-events-none relative hidden w-[640px] max-w-full rounded-[2rem] border border-white/14 bg-[linear-gradient(180deg,#24302d,#161d1b)] p-4 shadow-[0_40px_90px_rgba(0,0,0,0.45)] lg:block">
      <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_22%)]" />
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-[#eef6f3] text-black">
        <div className="flex items-center justify-between border-b border-black/8 bg-white px-5 py-3">
          <div className="flex items-center gap-3">
            <Image src="/mindfullailogo.svg" alt="MindfulAI" width={28} height={28} />
            <div>
              <div className="text-sm font-semibold text-black">MindfulAI</div>
              <div className="text-xs text-black/45">web dashboard</div>
            </div>
          </div>
          <div className="rounded-full bg-[#74AA9C]/10 px-3 py-1 text-xs font-semibold text-[#5d9088]">
            Онлайн сегодня
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-[1.4rem] bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5d9088]">Дневник состояния</div>
              <div className="mt-3 text-2xl font-semibold text-black">Настроение, сон и мысли</div>
              <div className="mt-2 text-sm leading-relaxed text-black/60">
                Ежедневные записи, ABC-разбор ситуаций и аккуратная аналитика в одном месте.
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <MiniStat value="5.8" label="среднее настроение" />
                <MiniStat value="3ч 29м" label="средний сон" />
                <MiniStat value="6" label="записей" />
              </div>
            </div>

            <div className="rounded-[1.4rem] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-black">Последняя рекомендация</div>
                  <div className="mt-1 text-xs text-black/50">На основе заметок и переписки</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#74AA9C]/10">
                  <Brain className="h-5 w-5 text-[#5d9088]" />
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[#f5faf8] p-4 text-sm leading-relaxed text-black/70">
                Сегодня полезно сделать короткий check-in, зафиксировать мысль и сравнить реакцию с тем, как ты видел ситуацию вчера.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.4rem] bg-[#10362f] p-5 text-white shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a9e2d6]">AI-анализ</div>
              <div className="mt-3 text-lg font-semibold">Паттерны недели</div>
              <div className="mt-3 space-y-3 text-sm text-white/78">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Тревога усиливается в учебные дни</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Сон ниже 6 часов влияет на настроение</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">ABC-записи помогают снизить напряжение</div>
              </div>
            </div>

            <div className="rounded-[1.4rem] bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-black">Прогресс по неделе</div>
              <div className="mt-4 flex h-28 items-end gap-3">
                {[42, 78, 56, 88, 64, 92, 73].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-2xl bg-[linear-gradient(180deg,#9fd9cb,#74AA9C)]" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 left-[10%] h-10 w-[80%] rounded-full bg-black/35 blur-2xl" />
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-[#f8fbfa] px-3 py-3">
      <div className="text-base font-semibold text-[#5d9088]">{value}</div>
      <div className="mt-1 text-[11px] leading-tight text-black/45">{label}</div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="relative z-10 h-[902px] w-[436px] max-w-[94vw] rounded-[2.45rem] border border-white/20 bg-[linear-gradient(180deg,#1b2122,#101415)] p-3.5 shadow-[0_40px_90px_rgba(0,0,0,0.52)] lg:absolute lg:right-4 lg:top-14 lg:rotate-[6deg]">
      <div className="absolute right-0 top-8 h-[72%] w-2 rounded-r-2xl bg-white/12" />
      <div className="absolute left-1/2 top-2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-white/12" />
      <div className="h-full overflow-hidden rounded-[1.95rem] bg-[#102736] text-white">
        <div className="flex items-center gap-3 bg-[#2b2f34] px-4 py-3.5">
          <Image src="/mindfullailogo.svg" alt="MindfulAI bot" width={38} height={38} className="rounded-full bg-white" />
          <div>
            <div className="text-lg font-semibold">MindfulAI</div>
            <div className="text-sm text-white/55">бот</div>
          </div>
        </div>

        <div className="space-y-3 bg-[linear-gradient(180deg,#0f2a39,#122a35)] px-3 pb-4 pt-3">
          <div className="mx-auto w-fit rounded-full bg-[#0b3450] px-3 py-1 text-xs font-medium text-white/75">
            15 апреля
          </div>

          <MessageBubble align="right" time="01:43" accent>
            Влад мне сказал, что я плесень
          </MessageBubble>
          <MessageBubble align="left" time="01:43">
            Слушаю тебя. Расскажи больше об этом. Что именно он сказал и как это повлияло на твоё отношение к себе?
          </MessageBubble>
          <MessageBubble align="right" time="01:44" accent>
            /start
          </MessageBubble>
          <MessageBubble align="left" time="01:44">
            Добро пожаловать в MindfulAI! Выберите действие:
          </MessageBubble>

          <div className="rounded-[1.4rem] bg-[#1e2024] p-3">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#3b8dd6] px-3 py-1.5 text-sm font-semibold">
              <span className="text-lg leading-none">☰</span>
              Меню
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Записать заметку",
                "Мои заметки",
                "Анализ",
                "Статистика",
                "Напоминание",
                "Помощь",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-[#2a2b31] px-3 py-3 text-center text-[13px] font-medium text-white/92">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 left-[14%] h-10 w-[72%] rounded-full bg-black/40 blur-2xl" />
    </div>
  );
}

function MessageBubble({ children, align = "left", time, accent = false }) {
  const isRight = align === "right";

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-[1.35rem] px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
          accent
            ? "rounded-br-md bg-[linear-gradient(135deg,#a24fe5,#5b80ff)] text-white"
            : "rounded-bl-md bg-[#26282c] text-white/92"
        }`}
      >
        <div>{children}</div>
        <div className={`mt-1 text-[11px] ${accent ? "text-white/75" : "text-white/45"}`}>{time}</div>
      </div>
    </div>
  );
}