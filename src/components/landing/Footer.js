export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/15 grid place-items-center font-bold">
              ✿
            </div>
            <div className="text-2xl font-semibold">mindfulai</div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Resources
              </div>
              <ul className="mt-4 space-y-3 text-white/90">
                <li className="hover:underline cursor-pointer">How MindfulAI Helps</li>
                <li className="hover:underline cursor-pointer">How We Protect Your Data</li>
                <li className="hover:underline cursor-pointer">Types of Support</li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Contact
              </div>
              <div className="mt-4 text-white/90">support@mindfulai.app</div>
              <div className="mt-6 flex items-center gap-4 text-white/90">
                <span className="h-10 w-10 rounded-full bg-white/15 grid place-items-center cursor-pointer hover:bg-white/25">
                  f
                </span>
                <span className="h-10 w-10 rounded-full bg-white/15 grid place-items-center cursor-pointer hover:bg-white/25">
                  ig
                </span>
                <span className="h-10 w-10 rounded-full bg-white/15 grid place-items-center cursor-pointer hover:bg-white/25">
                  x
                </span>
                <span className="h-10 w-10 rounded-full bg-white/15 grid place-items-center cursor-pointer hover:bg-white/25">
                  tt
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 h-px bg-white/20" />

        <div className="mt-8 flex flex-col gap-4 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <div>Copyright © 2026 mindfulai. All rights reserved.</div>
          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms and Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
