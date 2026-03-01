import Footer from "@/components/landing/Footer";
import {
  AboutHeroSection,
  WelcomeSection,
  ServicesSection,
  TestimonialsSection,
  NewsSection,
  ValuesSection,
  TeamVisionSection,
  ImportantNoticeSection,
} from "./AboutSections";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AboutHeroSection />

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <WelcomeSection />
        <ServicesSection />
        <TestimonialsSection />
        <NewsSection />
        <ValuesSection />
        <TeamVisionSection />
        <ImportantNoticeSection />
      </main>

      <Footer />
    </div>
  );
}
