import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DemoSection from "@/components/landing/DemoSection";
import FinalCtaSection from "@/components/landing/FinalCtaSection";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="bg-white">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <HowItWorksSection />
      <FinalCtaSection />

      {/* FAQ в конце перед футером (как ты просил) */}
      <FaqSection />

      <Footer />
    </main>
  );
}
