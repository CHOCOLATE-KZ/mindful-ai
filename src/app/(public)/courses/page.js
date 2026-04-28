"use client";

import { useState } from "react";

// Заглушка для будущей архитектуры курсов
export default function CoursesPage() {
  // Здесь будет логика загрузки курсов, прогресса и т.д.
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-6 text-blue-700">Видеокурсы по психологии</h1>
        <p className="mb-8 text-lg text-blue-900">Платформа для прохождения структурированных онлайн-курсов с видеоуроками, прогрессом и сертификатами.</p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по курсам..."
          className="w-full mb-8 p-3 border border-blue-200 rounded-xl"
        />
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center text-blue-700">
          Здесь появятся курсы. Реализуйте backend и логику отображения!
        </div>
      </div>
    </div>
  );
}
