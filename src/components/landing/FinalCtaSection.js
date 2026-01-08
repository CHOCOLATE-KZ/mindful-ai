import Link from "next/link";
import Button from "../ui/Button";

export default function FinalCtaSection() {
  return (
    <section className="bg-indigo-50 py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Готовы начать заботиться о себе?</h2>
        <p className="mt-2 text-gray-600">Присоединяйтесь к сообществу ежедневной поддержки и практик.</p>
        <div className="mt-6">
          <Link href="/auth/sign-up">
            <Button variant="primary">Зарегистрироваться</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
