import Link from "next/link";

export default function AuthRequired({ t }) {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-4">
      <div className="rounded-2xl border border-[#8ecbc2] bg-[#eef8f6] p-6">
        <h2 className="text-lg font-semibold text-[#2a4842]">{t("authRequired")}</h2>
        <p className="text-[#3a6058] text-sm mt-2">
          {t("authRequiredHint")}
        </p>
      </div>
      <Link
        href="/auth/sign-in"
        className="inline-block px-4 py-2 rounded-xl bg-[#5d9088] text-white font-semibold hover:bg-[#4a7a70] transition"
      >
        {t("signIn")}
      </Link>
    </div>
  );
}
