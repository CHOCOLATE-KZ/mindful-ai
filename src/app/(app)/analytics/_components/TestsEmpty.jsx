import Link from "next/link";

export default function TestsEmpty({ t }) {
  return (
    <div className="rounded-2xl border border-[#8ecbc2] bg-[#eef8f6] p-8 text-center">
      <p className="text-[#2a4842] font-semibold mb-4">
        {t("noTestsYet")}
      </p>
      <Link
        href="/exercises"
        className="inline-block px-4 py-2.5 rounded-xl bg-[#5d9088] text-white font-semibold hover:bg-[#4a7a70] transition"
      >
        {t("goToExercises")} →
      </Link>
    </div>
  );
}
