import { Brain, Sparkles, ShieldCheck } from "lucide-react";

export default function BenefitsSection() {
  return (
    <section className="grid gap-6 md:grid-cols-3 items-stretch relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-slate-50/50 rounded-[3rem] -mx-6 sm:-mx-10" />
      
      <div className="group rounded-[2rem] border border-white/60 bg-white/80 backdrop-blur-md p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 h-full hover:-translate-y-1.5 flex flex-col pt-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-600 flex-shrink-0 border border-teal-100/50 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-500">
            <Brain className="h-7 w-7" />
          </div>
          <div className="text-xl font-bold text-slate-800">Понимание себя</div>
        </div>
        <p className="text-base text-slate-600 leading-relaxed font-light">
          Пройдите диагностику и посмотрите, какие сферы требуют внимания. Узнайте себя глубже и научитесь управлять своим состоянием.
        </p>
      </div>

      <div className="group rounded-[2rem] border border-white/60 bg-white/80 backdrop-blur-md p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 h-full hover:-translate-y-1.5 flex flex-col pt-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 flex-shrink-0 border border-emerald-100/50 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-500">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="text-xl font-bold text-slate-800">Микро-привычки</div>
        </div>
        <p className="text-base text-slate-600 leading-relaxed font-light">
          Делайте 1 короткое упражнение в день — накопительный эффект для вашей психики появится быстрее, чем кажется.
        </p>
      </div>

      <div className="group rounded-[2rem] border border-white/60 bg-white/80 backdrop-blur-md p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 h-full hover:-translate-y-1.5 flex flex-col pt-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-50 text-cyan-600 flex-shrink-0 border border-cyan-100/50 group-hover:scale-110 group-hover:bg-cyan-100 transition-all duration-500">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="text-xl font-bold text-slate-800">Спокойный темп</div>
        </div>
        <p className="text-base text-slate-600 leading-relaxed font-light">
          Без гонки и давления. Главное — регулярность и бережное, экологичное отношение к своим ресурсам.
        </p>
      </div>
    </section>
  );
}
