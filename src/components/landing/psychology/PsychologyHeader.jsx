import { Brain } from "lucide-react";

export default function PsychologyHeader() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#74AA9C]/10 border border-[#74AA9C]/30 text-[#74AA9C] font-semibold mb-4">
        <Brain className="w-5 h-5" />
        <span>Научная психология</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
        Узнайте, как работает ваш разум
      </h2>
      <p className="text-lg text-black max-w-2xl mx-auto">
        Психологические факты и советы от экспертов, основанные на научных исследованиях
      </p>
    </div>
  );
}
