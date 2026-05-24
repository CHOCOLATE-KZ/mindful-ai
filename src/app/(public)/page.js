import "@/components/landing/landing.css";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DemoSection from "@/components/landing/DemoSection";
import PsychologySection from "@/components/landing/PsychologySection";
import FaqSection from "@/components/landing/FaqSection";
import FinalCtaSection from "@/components/landing/FinalCtaSection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative bg-[#f7f4ec]">
      <HeroSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <FeaturesSection />
      <DemoSection />
      <PsychologySection />
      <FaqSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}
