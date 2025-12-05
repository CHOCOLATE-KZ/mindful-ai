import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata = {
  title: "Diploma Project",
  description: "Starter",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-dvh bg-[rgb(var(--bg))] text-[rgb(var(--fg))]`}>
        {children}
      </body>
    </html>
  );
}
  