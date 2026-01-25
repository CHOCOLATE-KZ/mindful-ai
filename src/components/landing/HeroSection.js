"use client";

import Link from "next/link";
import ChatDemo from "@/components/landing/ChatDemo";
import TypingText from "@/components/ui/TypingText";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden max-h-[700px]">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-black/70">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Calm • Private • Supportive
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-black md:text-5xl min-h-[3.4em]">
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                <TypingText
                  texts={[
                    "Feel Better with AI  Therapy",
                    "Calm support, anytime you need",
                    "Private. Gentle. Helpful.",
                  ]}
                  speed={45}
                  pause={1200}
                />
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-black/70">
              Talk through your problems at your own pace, without judgment.
            </p>

            {/* Email input row */}
            <div className="mt-8 flex max-w-xl items-center gap-3">
              <input
                type="email"
                placeholder="Your Email Address"
                className="h-14 w-full rounded-xl border border-blue-200 bg-white px-4 text-base text-black outline-none ring-0 placeholder:text-black/40 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                className="h-14 w-14 shrink-0 rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm transition hover:shadow-md"
                aria-label="Continue"
              >
                →
              </button>
            </div>

            <div className="my-6 flex items-center gap-4 max-w-xl">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-sm text-black/40">or</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            {/* Social buttons */}
            <div className="flex max-w-xl flex-col gap-3">
              <button className="h-12 w-full rounded-xl bg-blue-600 text-white font-medium shadow-sm transition hover:opacity-95">
                Continue with Google
              </button>
              <button className="h-12 w-full rounded-xl bg-black text-white font-medium shadow-sm transition hover:opacity-95">
                Continue with Apple
              </button>

              <div className="pt-2 text-sm text-black/60">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </div>

          {/* Right - chat preview */}
          <div className="relative">
            <div className="absolute -inset-10 -z-10 bg-gradient-to-br from-blue-100 via-white to-purple-100 blur-2xl" />
            <ChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
