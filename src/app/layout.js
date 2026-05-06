import "./globals.css";
import AppShell from "@/components/AppShell";
import LayoutContent from "@/app/LayoutContent";
import NavObserver from "@/components/NavObserver";

export const metadata = {
  title: "MindfulAI - Психологическая поддержка через AI",
  description: "Персональный AI-ассистент для психологической поддержки, медитации и развития осознанности",
  icons: {
    icon: "/mindfullailogo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <AppShell>
          <NavObserver />
          <LayoutContent>{children}</LayoutContent>
        </AppShell>
      </body>
    </html>
  );
}
