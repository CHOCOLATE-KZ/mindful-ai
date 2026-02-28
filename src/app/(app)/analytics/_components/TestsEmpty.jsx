import Link from "next/link";

export default function TestsEmpty({ t }) {
  return (
    <div className="rounded-2xl border border-blue-300 bg-blue-50 p-8 text-center">
      <p className="text-blue-800 font-semibold mb-4">
        {t("noTestsYet")}
      </p>
      <Link
        href="/exercises"
        className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
      >
        {t("goToExercises")} →
      </Link>
    </div>
  );
}
