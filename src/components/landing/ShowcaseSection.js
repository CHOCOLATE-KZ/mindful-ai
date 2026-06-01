import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Brain,
  NotebookPen,
  ShieldCheck,
  Wifi,
  Battery,
} from "lucide-react";
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

        <div className="relative flex min-h-[420px] items-center justify-center sm:min-h-[500px] lg:min-h-[560px]">
          <TabletMock orientation="portrait" className="z-10 w-full max-w-[400px] lg:hidden" />
          <TabletMock
            orientation="landscape"
            className="z-10 hidden w-full max-w-[540px] lg:block lg:-translate-x-10"
          />
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

function TabletMock({ orientation = "portrait", className = "" }) {
  const isLandscape = orientation === "landscape";

  return (
    <div className={["relative mx-auto", className].join(" ")}>
      <div
        className={[
          "relative bg-[linear-gradient(145deg,#3d4548_0%,#1a1e20_45%,#0f1112_100%)]",
          "shadow-[0_32px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]",
          isLandscape ? "rounded-[1.25rem] p-3" : "rounded-[1.35rem] p-[10px] sm:p-3",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,transparent_42%,transparent_78%,rgba(255,255,255,0.04)_100%)]",
            isLandscape ? "rounded-[1.25rem]" : "rounded-[1.35rem]",
          ].join(" ")}
        />

        <div
          className={[
            "absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#0a0c0d] ring-1 ring-white/10",
            isLandscape ? "top-3 h-1.5 w-1.5" : "top-[14px] h-2 w-2",
          ].join(" ")}
        />

        <div
          className={[
            "absolute -left-[3px] rounded-l-sm bg-[linear-gradient(90deg,#2a2e30,#1a1d1f)]",
            isLandscape ? "top-[28%] h-7 w-[3px]" : "top-[22%] h-8 w-[3px]",
          ].join(" ")}
        />
        <div
          className={[
            "absolute -left-[3px] rounded-l-sm bg-[linear-gradient(90deg,#2a2e30,#1a1d1f)]",
            isLandscape ? "top-[40%] h-7 w-[3px]" : "top-[32%] h-8 w-[3px]",
          ].join(" ")}
        />

        <div
          className={[
            "relative overflow-hidden border border-black/50 bg-[#0a0c0b]",
            isLandscape ? "rounded-xl" : "rounded-[1.05rem]",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_18%)]" />

          {isLandscape ? <TabletLandscapeUI /> : <TabletPortraitUI />}

          <div className="absolute bottom-1.5 left-1/2 z-20 h-1 w-14 -translate-x-1/2 rounded-full bg-black/25" />
        </div>
      </div>

      <div
        className={[
          "absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/45 blur-2xl",
          isLandscape ? "h-7 w-[72%]" : "h-8 w-[78%]",
        ].join(" ")}
      />
    </div>
  );
}

function TabletPortraitUI() {
  return (
    <div className="text-[10px] sm:text-[11px]">
      <TabletStatusBar />
      <TabletAppHeader compact />
      <div className="space-y-2 bg-[#eef6f3] p-2.5 sm:p-3">
        <DiaryCard compact />
        <div className="grid grid-cols-2 gap-2">
          <AiInsightsCard compact />
          <ProgressCard compact />
        </div>
        <RecommendationStrip compact />
      </div>
    </div>
  );
}

function TabletLandscapeUI() {
  return (
    <div className="text-[11px]">
      <TabletStatusBar />
      <TabletAppHeader />
      <div className="grid grid-cols-[1.15fr_0.85fr] gap-3 bg-[#eef6f3] p-3">
        <div className="space-y-2.5">
          <DiaryCard />
          <RecommendationStrip />
        </div>
        <div className="space-y-2.5">
          <AiInsightsCard />
          <ProgressCard tall />
        </div>
      </div>
    </div>
  );
}

function TabletStatusBar() {
  return (
    <div className="flex items-center justify-between bg-[#f8fbfa] px-3 py-1 text-black/55">
      <span className="text-[9px] font-medium">9:41</span>
      <div className="flex items-center gap-1">
        <Wifi className="h-2.5 w-2.5" />
        <Battery className="h-2.5 w-2.5" />
      </div>
    </div>
  );
}

function TabletAppHeader({ compact = false }) {
  return (
    <div className="flex items-center justify-between border-b border-black/6 bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <Image src="/mindfullailogo.svg" alt="" width={compact ? 16 : 20} height={compact ? 16 : 20} />
        <div>
          <div className={`font-semibold text-black ${compact ? "text-[9px]" : "text-[11px]"}`}>
            MindfulAI
          </div>
          {!compact && <div className="text-[9px] text-black/40">веб-панель</div>}
        </div>
      </div>
      <span className="rounded-full bg-[#74AA9C]/12 px-2 py-0.5 text-[8px] font-semibold text-[#5d9088]">
        онлайн
      </span>
    </div>
  );
}

function DiaryCard({ compact }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="text-[8px] font-semibold uppercase tracking-wider text-[#5d9088]">
        Дневник состояния
      </div>
      <div className={`mt-1 font-semibold text-black ${compact ? "text-[11px]" : "text-sm"}`}>
        Настроение, сон и мысли
      </div>
      {!compact && (
        <p className="mt-1 text-[9px] leading-snug text-black/55">
          Записи, ABC-разбор и аналитика в одном месте.
        </p>
      )}
      <div className={`mt-2 grid grid-cols-3 gap-1.5 ${compact ? "" : "gap-2"}`}>
        <TabletMiniStat value="5.8" label="настроение" />
        <TabletMiniStat value="3ч29" label="сон" />
        <TabletMiniStat value="6" label="записей" />
      </div>
    </div>
  );
}

function AiInsightsCard({ compact }) {
  return (
    <div className="rounded-xl bg-[#10362f] p-3 text-white">
      <div className="text-[8px] font-semibold uppercase tracking-wider text-[#a9e2d6]">
        AI-анализ
      </div>
      <div className={`mt-1 font-semibold ${compact ? "text-[10px]" : "text-xs"}`}>
        Паттерны недели
      </div>
      <div className="mt-1.5 space-y-1">
        <InsightLine text="Тревога в учебные дни" />
        <InsightLine text="Сон менее 6 ч → настроение" />
        {!compact && <InsightLine text="ABC снижает напряжение" />}
      </div>
    </div>
  );
}

function InsightLine({ text }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[8px] text-white/78">
      {text}
    </div>
  );
}

function ProgressCard({ compact, tall }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className={`font-semibold text-black ${compact ? "text-[10px]" : "text-xs"}`}>
        Прогресс по неделе
      </div>
      <div
        className={`mt-2 flex items-end gap-1 ${tall ? "h-20" : compact ? "h-10" : "h-14"}`}
      >
        {[42, 78, 56, 88, 64, 92, 73].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-[linear-gradient(180deg,#9fd9cb,#74AA9C)]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationStrip({ compact }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-white p-2.5 shadow-sm">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#74AA9C]/10">
        <Brain className="h-3.5 w-3.5 text-[#5d9088]" />
      </div>
      <div>
        <div className={`font-semibold text-black ${compact ? "text-[9px]" : "text-[10px]"}`}>
          Рекомендация дня
        </div>
        <p className="mt-0.5 text-[8px] leading-snug text-black/60 sm:text-[9px]">
          Короткий check-in и заметка помогут снизить напряжение сегодня.
        </p>
      </div>
    </div>
  );
}

function TabletMiniStat({ value, label }) {
  return (
    <div className="rounded-lg border border-black/6 bg-[#f8fbfa] px-1.5 py-1.5 text-center">
      <div className="text-[10px] font-semibold text-[#5d9088]">{value}</div>
      <div className="text-[6px] text-black/45">{label}</div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="relative z-20 mt-8 w-[280px] max-w-[88vw] sm:w-[300px] lg:absolute lg:right-0 lg:top-12 lg:mt-0 lg:w-[300px] lg:rotate-[6deg] xl:w-[320px]">
      <Image
        src="/phone_mockup_3d.png"
        alt="MindfulAI в Telegram"
        width={900}
        height={1800}
        className="w-full drop-shadow-[0_40px_90px_rgba(0,0,0,0.52)]"
        priority
      />
      <div className="absolute -bottom-5 left-[14%] h-10 w-[72%] rounded-full bg-black/40 blur-2xl" />
    </div>
  );
}
