import Card from "../ui/Card";

export default function DemoSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Демо</h2>
        <p className="mt-2 text-gray-600 text-center">Мини-превью диалога — спокойный пример интеракции.</p>

        <div className="mt-6">
          <Card className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-indigo-100" />
                <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-gray-900">Привет — последнее время я часто переживаю перед сном.</div>
              </div>

              <div className="flex items-start gap-3 self-end">
                <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-800">Понял, попробуем простую технику расслабления: вдох 4, задержка 4, выдох 6. Хочешь попробовать?</div>
              </div>

              <div className="mt-2 flex gap-2">
                <button className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-600">Попробовать</button>
                <button className="rounded-full bg-white px-3 py-1 text-sm text-gray-600">Ещё пример</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
