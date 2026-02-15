import "./globals.css";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";
import NavObserver from "@/components/NavObserver";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <AppShell>
          <NavObserver />
          <Navbar />
          {children}
        </AppShell>
      </body>
    </html>
  );
}
