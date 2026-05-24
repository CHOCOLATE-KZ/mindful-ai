import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "IITUpsychologyAIbot";
const telegramLink = `https://t.me/${botUsername}?start=login`;

export default function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <div className="absolute inset-0">
        <Image
          src="/wallpaper1gpt.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(247,244,236,0.92)_0%,rgba(116,170,156,0.75)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#10211f]/70">
          Начни сегодня
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#10211f] md:text-4xl">
          Готов заботиться о себе спокойно и без спешки?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#17302c]/80">
          Войди через Telegram за минуту — или открой чат в браузере. MindfulAI рядом, когда
          нужна поддержка или короткая практика.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#74AA9C] px-6 font-semibold text-white shadow-[0_14px_34px_rgba(116,170,156,0.30)] transition hover:brightness-105 sm:w-auto"
          >
            Войти через Telegram
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/chat"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-[#10211f]/15 bg-white/80 px-6 font-semibold text-[#10211f] backdrop-blur-sm transition hover:bg-white sm:w-auto"
          >
            <MessageCircle className="h-4 w-4 text-[#5d9088]" />
            Открыть чат
          </Link>
        </div>

        <p className="mt-6 text-xs text-[#17302c]/55">
          Не заменяет лицензированного психолога. При кризисе обращайся к специалисту или
          экстренным службам.
        </p>
      </div>
    </section>
  );
}
