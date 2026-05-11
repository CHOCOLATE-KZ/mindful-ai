import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";

export default function Footer() {
  const socialIcons = [
    { icon: <FaFacebookF />, name: "Facebook", href: "#" },
    { icon: <FaInstagram />, name: "Instagram", href: "#" },
    { icon: <FaTwitter />, name: "X/Twitter", href: "#" },
    { icon: <SiTiktok />, name: "TikTok", href: "#" },
  ];

  return (
    <footer className="relative text-white overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/footerimg.png')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-full bg-white/15 grid place-items-center font-bold transition-transform duration-300 group-hover:scale-110">
                <Image src="/white-logo.svg" alt="MindfulAI" width={24} height={24} className="w-6 h-6 object-contain" />
              </div>
              <div className="text-2xl font-semibold transition-colors duration-300 group-hover:text-blue-200">
                MindfulAI
              </div>
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Информация
              </div>
              <ul className="mt-4 space-y-3 text-white/90">
                <li>
                  <Link href="/about" className="hover:underline hover:text-blue-200 transition-colors duration-300">
                    О приложении
                  </Link>
                </li>
                <li>
                  <Link href="/psychology" className="hover:underline hover:text-blue-200 transition-colors duration-300">
                    База знаний по психологии
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:underline hover:text-blue-200 transition-colors duration-300">
                    Часто задаваемые вопросы
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:underline hover:text-blue-200 transition-colors duration-300">
                    Новости
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Помощь
              </div>
              <ul className="mt-4 space-y-3 text-white/90">
                <li>
                  <Link href="/chat" className="hover:underline hover:text-blue-200 transition-colors duration-300">
                    Чат с поддержкой
                  </Link>
                </li>
                <li>
                  <Link href="/contacts" className="hover:underline hover:text-blue-200 transition-colors duration-300">
                    Связаться с нами
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@mindfulai.app" className="hover:underline hover:text-blue-200 transition-colors duration-300">
                    support@mindfulai.app
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Сообщество
              </div>
              <div className="mt-4 flex items-center gap-3 text-white/90">
                {socialIcons.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    title={item.name}
                    className="h-10 w-10 rounded-full bg-white/15 grid place-items-center transition-all duration-300 hover:bg-white/25 hover:scale-110 hover:text-blue-200 text-lg"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 h-px bg-white/20" />

        <div className="mt-8 flex flex-col gap-4 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <div>Copyright © 2026 MindfulAI. Все права защищены.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline hover:text-blue-200 transition-colors duration-300">
              Приватность
            </Link>
            <Link href="/terms" className="hover:underline hover:text-blue-200 transition-colors duration-300">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
