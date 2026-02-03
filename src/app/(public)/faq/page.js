import FaqSection from "../../../components/landing/FaqSection";
import Footer from "../../../components/landing/Footer";

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900">Часто задаваемые вопросы</h1>
        <p className="mt-2 text-gray-600">Ниже — ответы на наиболее частые вопросы.</p>

        <div className="mt-6">
          <FaqSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
