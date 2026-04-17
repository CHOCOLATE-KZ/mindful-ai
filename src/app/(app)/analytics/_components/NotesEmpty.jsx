import Link from "next/link";

export default function NotesEmpty({ t }) {
  return (
    <div className="rounded-3xl border border-[#8ecbc2] bg-[#eef8f6] p-8 text-center shadow-sm">
      <p className="text-[#2a4842] font-semibold">{t("noEntriesYet")}</p>
      <p className="text-[#3a6058] text-sm mt-2">{t("noEntriesHint")}</p>
      <Link
        href="/notes"
        className="inline-block mt-4 px-4 py-2.5 rounded-xl bg-[#5d9088] text-white font-semibold hover:bg-[#4a7a70] transition"
      >
        {t("goToJournal")} &gt;
      </Link>
    </div>
  );
}
