import Link from "next/link";
import Button from "../ui/Button";

export default function HeroSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-4xl font-extrabold leading-tight text-gray-900">Mindful AI — мягкая поддержка для эмоционального баланса</h1>
        <p className="mt-4 text-lg text-gray-600">Короткие осознанные диалоги и упражнения, которые помогают снизить тревогу и улучшить фокус.</p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/auth/sign-up">
            <Button variant="primary">Начать</Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button variant="ghost">Войти</Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">Без давления, без клинических диагнозов — просто забота и ориентиры.</p>
      </div>
    </section>
  );
}
