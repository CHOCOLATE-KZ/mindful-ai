"use client";

import Link from "next/link";
import { ArrowLeft, Home, MessageCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Animated 404 */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
          <div className="relative text-center">
            <div className="text-9xl font-extrabold text-transparent bg-clip-text bg-[#5d9088] drop-shadow-lg">
              404
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Страница не найдена
          </h1>
          <p className="text-xl text-gray-600">
            Кажется, вы заблудились в цифровом пространстве. Но не волнуйтесь — MindfulAI здесь, чтобы помочь вам найти дорогу!
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Home Button */}
          <Link
            href="/"
            className="group relative overflow-hidden bg-blue-600 text-white rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <Home className="h-6 w-6" />
              <div>
                <div className="font-semibold">На главную</div>
                <div className="text-sm text-blue-100">Вернуться домой</div>
              </div>
            </div>
          </Link>

          {/* Chat Button */}
          <Link
            href="/chat"
            className="group relative overflow-hidden bg-blue-600 text-white rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <MessageCircle className="h-6 w-6" />
              <div>
                <div className="font-semibold">Чат</div>
                <div className="text-sm text-blue-100">Поговорить с ИИ</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Alternative Links */}
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 mb-8">
          <p className="text-sm font-semibold text-gray-600 mb-4">Или выберите раздел:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { href: "/about", label: "О проекте" },
              { href: "/exercises", label: "Упражнения" },
              { href: "/notes", label: "Дневник" },
              { href: "/news", label: "Новости" },
              { href: "/faq", label: "FAQ" },
              { href: "/contacts", label: "Контакты" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-center py-3 px-4 rounded-lg bg-white hover:from-blue-50 hover:to-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 ring-1 ring-black/5 hover:ring-blue-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center text-gray-600 space-y-2">
          <p className="text-lg font-medium">
            Помните: каждый шаг ведет вас к лучшему пониманию себя ‍️
          </p>
          <p className="text-sm">
            Нужна помощь?{" "}
            <Link href="/contacts" className="text-blue-600 hover:underline font-semibold">
              Свяжитесь с нами
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
