import { ArrowRight, Brain } from "lucide-react";
import Link from "next/link";

export default function PsychologyCta() {
  return (
    <div className="text-center">
      <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-white border-2 border-blue-200">
        <div className="text-black text-lg font-medium">
          Хотите узнать <span className="font-bold text-[#5479F7]">30+ научных фактов</span> о психологии?
        </div>
        <Link
          href="/psychology"
          className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#5479F7] text-white font-bold text-lg shadow-lg hover:bg-blue-600 transition-all"
        >
          <Brain className="w-6 h-6" />
          <span>Открыть базу знаний</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="text-sm text-black">
          Научные исследования, статистика и экспертные советы
        </p>
      </div>
    </div>
  );
}
