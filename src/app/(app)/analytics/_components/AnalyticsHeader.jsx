export default function AnalyticsHeader({ t }) {
  return (
    <div className="space-y-2">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="text-gray-600">{t("subtitle")}</p>
    </div>
  );
}
