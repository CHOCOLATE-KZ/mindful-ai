import { Brain, Sparkles, ShieldCheck } from "lucide-react";

export default function BenefitsSection() {
  return (
    <section className="grid gap-5 md:grid-cols-3 items-stretch">
      <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm p-6 shadow-md hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex-shrink-0">
            <Brain className="h-6 w-6" />
          </div>
          <div className="font-semibold text-slate-900">Понимание себя</div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Пройдите тест и посмотрите, какие темы требуют внимания. Узнайте себя лучше.
        </p>
      </div>

      <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm p-6 shadow-md hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex-shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="font-semibold text-slate-900">Микро-привычки</div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Делайте 1 упражнение в день — эффект накапливается быстрее, чем кажется.
        </p>
      </div>

      <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm p-6 shadow-md hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 flex-shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="font-semibold text-slate-900">Спокойный темп</div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Без гонки. Главное — регулярность и бережность к себе.
        </p>
      </div>
    </section>
  );
}
