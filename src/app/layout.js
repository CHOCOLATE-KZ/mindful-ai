import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata = {
  title: "Diploma Project",
  description: "Starter",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={`${inter.className} min-h-dvh bg-[rgb(var(--bg))] text-[rgb(var(--fg))]`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
  