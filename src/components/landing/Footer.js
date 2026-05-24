import Link from "next/link";
import Image from "next/image";
import { FaTelegramPlane } from "react-icons/fa";

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "IITUpsychologyAIbot";
const telegramLink = `https://t.me/${botUsername}`;

export default function Footer() {
  return (
    <footer className="relative overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/footerimg.png')" }}
      />
      <div className="absolute inset-0 bg-[#10211f]/65" />

      <div className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15 transition group-hover:scale-105">
              <Image
                src="/white-logo.svg"
                alt="MindfulAI"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="text-2xl font-semibold transition group-hover:text-[#9fdfd0]">
              MindfulAI
            </div>
          </Link>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/75">
                Информация
              </div>
              <ul className="mt-4 space-y-3 text-white/90">
                <li>
                  <Link href="/about" className="transition hover:text-[#9fdfd0] hover:underline">
                    О приложении
                  </Link>
                </li>
                <li>
                  <Link
                    href="/psychology"
                    className="transition hover:text-[#9fdfd0] hover:underline"
                  >
                    База знаний
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="transition hover:text-[#9fdfd0] hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="transition hover:text-[#9fdfd0] hover:underline">
                    Новости
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/75">
                Помощь
              </div>
              <ul className="mt-4 space-y-3 text-white/90">
                <li>
                  <Link href="/chat" className="transition hover:text-[#9fdfd0] hover:underline">
                    Чат с поддержкой
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacts"
                    className="transition hover:text-[#9fdfd0] hover:underline"
                  >
                    Связаться с нами
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@mindfulai.app"
                    className="transition hover:text-[#9fdfd0] hover:underline"
                  >
                    support@mindfulai.app
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/75">
                Telegram
              </div>
              <p className="mt-4 text-sm text-white/70">
                Бот для быстрого входа и поддержки в привычном мессенджере.
              </p>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram-бот MindfulAI"
                className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-lg transition hover:scale-105 hover:bg-white/25 hover:text-[#9fdfd0]"
              >
                <FaTelegramPlane />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 h-px bg-white/20" />

        <div className="mt-8 flex flex-col gap-4 text-sm text-white/75 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 MindfulAI. Все права защищены.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition hover:text-[#9fdfd0] hover:underline">
              Приватность
            </Link>
            <Link href="/terms" className="transition hover:text-[#9fdfd0] hover:underline">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
