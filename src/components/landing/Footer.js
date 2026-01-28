import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { SiTiktok } from "react-icons/si"; // для TikTok

export default function Footer() {
  const socialIcons = [
    { icon: <FaFacebookF />, name: "Facebook" },
    { icon: <FaInstagram />, name: "Instagram" },
    { icon: <FaTwitter />, name: "X/Twitter" },
    { icon: <SiTiktok />, name: "TikTok" },
  ];

  return (
    <footer className="bg-blue-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/15 grid place-items-center font-bold transition-transform duration-300 hover:scale-110">
              ✿
            </div>
            <div className="text-2xl font-semibold transition-colors duration-300 hover:text-blue-200">
              mindfulai
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Resources
              </div>
              <ul className="mt-4 space-y-3 text-white/90">
                <li className="hover:underline hover:text-blue-200 cursor-pointer transition-colors duration-300">
                  How MindfulAI Helps
                </li>
                <li className="hover:underline hover:text-blue-200 cursor-pointer transition-colors duration-300">
                  How We Protect Your Data
                </li>
                <li className="hover:underline hover:text-blue-200 cursor-pointer transition-colors duration-300">
                  Types of Support
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Contact
              </div>
              <div className="mt-4 text-white/90">support@mindfulai.app</div>
              <div className="mt-6 flex items-center gap-4 text-white/90">
                {socialIcons.map((item, idx) => (
                  <span
                    key={idx}
                    title={item.name}
                    className="h-10 w-10 rounded-full bg-white/15 grid place-items-center cursor-pointer
                               transition-all duration-300 hover:bg-white/25 hover:scale-110 hover:text-blue-200 text-lg"
                  >
                    {item.icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 h-px bg-white/20" />

        <div className="mt-8 flex flex-col gap-4 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <div>Copyright © 2026 mindfulai. All rights reserved.</div>
          <div className="flex gap-6">
            <span className="hover:underline hover:text-blue-200 cursor-pointer transition-colors duration-300">
              Privacy Policy
            </span>
            <span className="hover:underline hover:text-blue-200 cursor-pointer transition-colors duration-300">
              Terms and Conditions
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
