import "./globals.css";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <AppShell>
          <Navbar />
          {children}
        </AppShell>
      </body>
    </html>
  );
}
