import Link from "next/link";

export default function NotesEmpty({ t }) {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center">
      <p className="text-amber-800 font-semibold">{t("noEntriesYet")}</p>
      <p className="text-amber-700 text-sm mt-2">{t("noEntriesHint")}</p>
      <Link
        href="/notes"
        className="inline-block mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
      >
        {t("goToJournal")} &gt;
      </Link>
    </div>
  );
}
