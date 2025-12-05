export default function Home() {
  return (
    <div className="relative overflow-hidden min-h-dvh">
      {/* 🔮 animated warm pastel background + fade-in */}
      <div className="absolute inset-0 -z-10 bg-liquid-warm bg-liquid-soft bg-fade-in"></div>

      <main className="flex items-center justify-center min-h-dvh p-4">
        <section className="w-full max-w-2xl rounded-3xl bg-white/95 shadow-2xl ring-1 ring-black/5 px-8 py-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <span className="text-3xl">✨</span>
          </div>

          <h1 className="text-center text-3xl font-semibold text-violet-600">
            Welcome to MindfulAI
          </h1>
          <p className="mt-3 text-center text-gray-600">
            Your personal AI companion for emotional well-being and personal growth
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ring-black/5 bg-gradient-to-r from-emerald-50 to-indigo-50">
              <span className="text-lg">💜</span>
              <span className="text-gray-700">Track your emotional journey</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ring-black/5 bg-gradient-to-r from-violet-50 to-amber-50">
              <span className="text-lg">🌙</span>
              <span className="text-gray-700">Improve sleep & daily habits</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ring-black/5 bg-gradient-to-r from-rose-50 to-sky-50">
              <span className="text-lg">😊</span>
              <span className="text-gray-700">Chat with empathetic AI support</span>
            </div>
          </div>

          <div className="mt-8">
            <a
              href="/auth/sign-up"
              className="block w-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-3 text-center text-white font-medium shadow-lg hover:opacity-95 active:opacity-90 transition"
            >
              Get Started →
            </a>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <span className="h-2 w-8 rounded-full bg-violet-500/80"></span>
            <span className="h-2 w-2 rounded-full bg-gray-300"></span>
            <span className="h-2 w-2 rounded-full bg-gray-300"></span>
            <span className="h-2 w-2 rounded-full bg-gray-300"></span>
          </div>
        </section>
      </main>
    </div>
  );
}
