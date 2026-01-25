"use client";

import Reveal from "@/components/ui/Reveal";
import { ShieldCheck, Brain, Sparkles } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Privacy-first security",
      subtitle: "Your data stays safe and private.",
      Icon: ShieldCheck,
      blob: "from-blue-200/70 via-blue-100/40 to-white",
      iconBg: "bg-blue-600",
    },
    {
      title: "Powerful memory",
      subtitle: "Remembers what matters to you.",
      Icon: Brain,
      blob: "from-purple-200/70 via-purple-100/40 to-white",
      iconBg: "bg-purple-600",
    },
    {
      title: "Personalized coaching",
      subtitle: "Support tailored to your goals.",
      Icon: Sparkles,
      blob: "from-orange-200/70 via-orange-100/40 to-white",
      iconBg: "bg-orange-500",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            When you have <span className="text-blue-600">MindfulAI</span> on your side
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mx-auto mt-4 max-w-3xl text-base text-black/60 sm:text-lg">
            Discover a safe way to get mental health support with strong privacy, memory,
            and evidence-based guidance.
          </p>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {features.map((f, idx) => (
          <Reveal key={f.title} delay={0.12 + idx * 0.08}>
            <FeatureCard {...f} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ title, subtitle, Icon, blob, iconBg }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-8 shadow-sm
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* мягкое свечение */}
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full
                    bg-gradient-to-br ${blob} blur-2xl opacity-70 transition-opacity duration-300
                    group-hover:opacity-90`}
      />

      {/* иконка */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl ${iconBg} text-white shadow-sm
                      transition-transform duration-300 group-hover:rotate-3 group-hover:scale-[1.03]`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <p className="mt-2 text-sm text-black/60">{subtitle}</p>

        {/* декоративная “карточка-иллюстрация” */}
        <div
          className="relative mt-8 h-40 w-40 rounded-3xl border border-black/5 bg-white/60 shadow-inner
                     backdrop-blur-sm transition-transform duration-300 group-hover:scale-[1.02]"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white to-black/5 opacity-70" />
          <div className="absolute -bottom-8 left-1/2 h-16 w-24 -translate-x-1/2 rounded-full bg-black/5 blur-2xl" />
        </div>
      </div>
    </div>
  );
}
