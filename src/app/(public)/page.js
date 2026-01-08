import HeroSection from "../../components/landing/HeroSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import HowItWorksSection from "../../components/landing/HowItWorksSection";
import DemoSection from "../../components/landing/DemoSection";
import FaqSection from "../../components/landing/FaqSection";
import FinalCtaSection from "../../components/landing/FinalCtaSection";
import Footer from "../../components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DemoSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
