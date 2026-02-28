import Link from "next/link";

export default function BackButtons() {
  return (
    <div className="flex gap-3">
      <Link
        href="/exercises"
        className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
      >
        ← Вернуться к тестам
      </Link>
      <Link
        href="/profile"
        className="inline-block px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
      >
        Мой профиль
      </Link>
    </div>
  );
}
