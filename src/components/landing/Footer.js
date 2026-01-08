import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white/90 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-700">© {new Date().getFullYear()} Mindful AI</div>
          <div className="flex gap-4 text-sm">
            <Link href="/about" className="text-gray-600 hover:underline">О проекте</Link>
            <Link href="/faq" className="text-gray-600 hover:underline">FAQ</Link>
            <Link href="/contacts" className="text-gray-600 hover:underline">Контакты</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
