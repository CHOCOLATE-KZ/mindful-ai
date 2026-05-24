import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Brain, NotebookPen, ShieldCheck } from "lucide-react";
import SectionLabel from "@/components/landing/SectionLabel";

export default function ShowcaseSection() {
  return (
    <section
      id="showcase"
      className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden py-20 text-white md:py-24"
    >
      <div
        className="landing-showcase-bg absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 85% 65% at 15% 35%, rgba(159, 217, 203, 0.42), transparent),
            radial-gradient(ellipse 70% 55% at 85% 75%, rgba(26, 46, 42, 0.55), transparent),
            linear-gradient(135deg, #3a6058 0%, #74AA9C 42%, #4a7a70 100%)
          `,
        }}
      />
      <div className="absolute inset-0 z-0 bg-[#10211f]/10" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <SectionLabel light>MindfulAI на всех платформах</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[3.2rem] lg:leading-[1.05]">
            Поддержка там, где тебе удобнее всего
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/75 sm:text-lg">
            Веб-интерфейс для дневника, аналитики и практик. Telegram-бот — для быстрого
            приватного контакта с MindfulAI в привычном мобильном формате.
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
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/12"
            >
              Дневник настроения
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <FeaturePill icon={ShieldCheck} text="Приватность" />
            <FeaturePill icon={NotebookPen} text="Дневник и анализ" />
            <FeaturePill icon={Bot} text="Telegram 24/7" />
          </div>
        </div>

        <div className="relative flex min-h-[420px] items-center justify-center sm:min-h-[500px] lg:min-h-[620px]">
          <MobileDashboardCard />
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

function MobileDashboardCard() {
  return (
    <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/15 bg-[#eef6f3] p-4 text-black shadow-xl lg:hidden">
      <div className="flex items-center gap-2 border-b border-black/8 pb-3">
        <Image src="/mindfullailogo.svg" alt="" width={24} height={24} />
        <div>
          <div className="text-sm font-semibold">MindfulAI</div>
          <div className="text-xs text-black/45">веб-панель</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-black/65">
        Дневник, AI-анализ и рекомендации — в одном спокойном интерфейсе.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat value="5.8" label="настроение" />
        <MiniStat value="6" label="записей" />
        <MiniStat value="AI" label="анализ" />
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
              <div className="text-xs text-black/45">веб-панель</div>
            </div>
          </div>
          <div className="rounded-full bg-[#74AA9C]/10 px-3 py-1 text-xs font-semibold text-[#5d9088]">
            Онлайн сегодня
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-[1.4rem] bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5d9088]">
                Дневник состояния
              </div>
              <div className="mt-3 text-2xl font-semibold text-black">Настроение, сон и мысли</div>
              <div className="mt-2 text-sm leading-relaxed text-black/60">
                Ежедневные записи, ABC-разбор и аккуратная аналитика в одном месте.
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
                Сегодня полезно сделать короткий check-in, зафиксировать мысль и сравнить реакцию
                с тем, как ты видел ситуацию вчера.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.4rem] bg-[#10362f] p-5 text-white shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a9e2d6]">
                AI-анализ
              </div>
              <div className="mt-3 text-lg font-semibold">Паттерны недели</div>
              <div className="mt-3 space-y-3 text-sm text-white/78">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  Тревога усиливается в учебные дни
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  Сон ниже 6 часов влияет на настроение
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  ABC-записи помогают снизить напряжение
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-black">Прогресс по неделе</div>
              <div className="mt-4 flex h-28 items-end gap-3">
                {[42, 78, 56, 88, 64, 92, 73].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-2xl bg-[linear-gradient(180deg,#9fd9cb,#74AA9C)]"
                    style={{ height: `${h}%` }}
                  />
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
    <div className="relative z-10 mt-6 w-[280px] max-w-[88vw] sm:w-[300px] lg:absolute lg:right-4 lg:top-14 lg:mt-0 lg:w-[320px] lg:max-w-[94vw] lg:rotate-[6deg]">
      <div className="relative rounded-[2.45rem] border border-white/20 bg-[linear-gradient(180deg,#1b2122,#101415)] p-3 shadow-[0_40px_90px_rgba(0,0,0,0.52)]">
        <div className="absolute right-0 top-[18%] h-[28%] w-1.5 rounded-r-xl bg-white/12" />
        <div className="absolute left-1/2 top-2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/12" />
        <div className="overflow-hidden rounded-[1.9rem]">
          <Image
            src="/phone_mockup.jpg"
            alt="MindfulAI в Telegram"
            width={600}
            height={1300}
            className="w-full object-cover"
          />
        </div>
      </div>
      <div className="absolute -bottom-5 left-[14%] h-10 w-[72%] rounded-full bg-black/40 blur-2xl" />
    </div>
  );
}
