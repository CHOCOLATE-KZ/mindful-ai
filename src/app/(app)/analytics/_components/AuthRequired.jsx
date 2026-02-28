import Link from "next/link";

export default function AuthRequired({ t }) {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-4">
      <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-6">
        <h2 className="text-lg font-semibold text-yellow-800">{t("authRequired")}</h2>
        <p className="text-yellow-700 text-sm mt-2">
          {t("authRequiredHint")}
        </p>
      </div>
      <Link
        href="/auth/sign-in"
        className="inline-block px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
      >
        {t("signIn")}
      </Link>
    </div>
  );
}
