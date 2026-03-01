import Link from "next/link";
import Button from "../ui/Button";

export default function FinalCtaSection() {
  return (
    <section className="bg-blue-50 py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-2xl font-semibold text-black">Готовы начать заботиться о себе?</h2>
        <p className="mt-2 text-black">Присоединяйтесь к сообществу ежедневной поддержки и практик.</p>
        <div className="mt-6">
          <Link href="/auth/sign-up">
            <Button variant="primary">Зарегистрироваться</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
