"use client";

import { AnimatePresence, motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import ActivityRating from "./ActivityRating";
import {
  FileText,
  RotateCcw,
  Smile,
  Moon,
  MessageSquare,
  SlidersHorizontal,
  Zap,
  Battery,
  Flame,
  Apple,
  Dumbbell,
  Gamepad2,
  Users,
  StickyNote,
  Plus,
  Lightbulb,
  CalendarDays,
  AlertTriangle,
  Heart,
  CheckCircle2,
} from "lucide-react";

/**
 * Компонент формы создания/редактирования заметки
 */
export default function NotesForm({ editor, quickNotes }) {
  return (
    <Card className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
<div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl opacity-50" />

      <div className="relative p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <FileText size={22} className="text-blue-600" />
              <h2 className="text-2xl font-semibold text-black">
                {editor.editingId ? "Редактировать запись" : "Новая запись"}
              </h2>
            </div>
            <p className="mt-2 text-sm text-black/65 leading-relaxed">
              {editor.noteType === "abc"
                ? "Разберите тревожную ситуацию по методике КПТ: триггер → реакция → последствия"
                : "Заполните настроение и сон (по желанию) и добавьте комментарий."}
            </p>
          </div>

          {editor.editingId && (
            <button
              type="button"
              onClick={editor.resetEditor}
              className="rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-black/70 hover:bg-black/[0.04] hover:border-black/20 transition-all shadow-sm"
            >
              <span className="inline-flex items-center gap-1.5"><RotateCcw size={14} /> Сбросить</span>
            </button>
          )}
        </div>

        {/* Переключатель типа записи */}
        <div className="mt-5 flex gap-2 rounded-2xl bg-gray-100/70 p-1">
          <button
            type="button"
            onClick={() => editor.setNoteType("daily")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              editor.noteType === "daily"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-black/50 hover:text-black/70"
            }`}
          >
            <CalendarDays size={15} />
            Ежедневная
          </button>
          <button
            type="button"
            onClick={() => editor.setNoteType("abc")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              editor.noteType === "abc"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-black/50 hover:text-black/70"
            }`}
          >
            <AlertTriangle size={15} />
            Разбор ситуации
          </button>
        </div>

        <form onSubmit={editor.saveNote} className="mt-6 space-y-5">

          <AnimatePresence mode="wait">
          {/* === ABC ФОРМА === */}
          {editor.noteType === "abc" && (
            <motion.div
              key="abc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-3"
            >
              {/* Подсказка */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 px-4 py-3">
                <p className="text-xs text-purple-700/80 leading-relaxed">
                  <span className="font-semibold">Методика КПТ (ABC)</span> — разбираем ситуацию по шагам: что случилось → как отреагировал → к чему это привело.
                </p>
              </div>

              {/* Вертикальный степпер A → B → C */}
              <div className="relative">
                {/* Соединительная линия */}
                <div className="absolute left-[19px] top-12 bottom-12 w-0.5 bg-gradient-to-b from-red-300 via-orange-300 to-green-300 z-0" />

                <div className="space-y-4 relative z-10">

                  {/* A — Триггер */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="relative group cursor-default">
                        {/* Пульс-кольцо */}
                        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25" style={{ animationDuration: "2.5s" }} />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white text-base font-black shadow-md shadow-red-200">
                          A
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-12 top-1/2 -translate-y-1/2 z-50 w-56 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="rounded-2xl bg-gray-900 px-3.5 py-2.5 text-xs text-white shadow-xl">
                            <p className="font-semibold text-red-300 mb-0.5">A — Antecedent</p>
                            <p className="text-white/80 leading-relaxed">Событие или ситуация, которая <span className="text-white font-medium">запустила</span> вашу реакцию. Триггер, предшествующий эмоции.</p>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-gray-900 rotate-45" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="mb-1.5">
                        <span className="text-sm font-semibold text-black/80">Antecedent — Предшествующее</span>
                      </div>
                      <textarea
                        rows={3}
                        value={editor.abcA}
                        onChange={(e) => editor.setAbcA(e.target.value)}
                        className="w-full rounded-2xl border border-red-100 bg-red-50/30 px-4 py-3 text-[14px] text-black/80 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100/50 transition-all resize-none"
                        placeholder="Опишите ситуацию, событие или слова, которые запустили сильную эмоцию..."
                      />
                      <p className="mt-1 text-[11px] text-black/40">Что случилось? Кто сказал или сделал? Где вы были?</p>
                    </div>
                  </div>

                  {/* B — Поведение/реакция */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="relative group cursor-default">
                        <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-25" style={{ animationDuration: "2.5s", animationDelay: "0.8s" }} />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-400 text-white text-base font-black shadow-md shadow-orange-200">
                          B
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-12 top-1/2 -translate-y-1/2 z-50 w-56 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="rounded-2xl bg-gray-900 px-3.5 py-2.5 text-xs text-white shadow-xl">
                            <p className="font-semibold text-orange-300 mb-0.5">B — Behavior</p>
                            <p className="text-white/80 leading-relaxed">Ваша <span className="text-white font-medium">реакция</span>: эмоции, мысли, телесные ощущения в момент события. Что вы почувствовали?</p>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-gray-900 rotate-45" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="mb-1.5">
                        <span className="text-sm font-semibold text-black/80">Behavior — Реакция</span>
                      </div>
                      <textarea
                        rows={3}
                        value={editor.abcB}
                        onChange={(e) => editor.setAbcB(e.target.value)}
                        className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-[14px] text-black/80 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 transition-all resize-none"
                        placeholder="Какие эмоции возникли? Что чувствовало тело? Какие мысли промелькнули?"
                      />
                      <p className="mt-1 text-[11px] text-black/40">Тревога, злость, обида? Сердцебиение, напряжение?</p>
                    </div>
                  </div>

                  {/* C — Последствия */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="relative group cursor-default">
                        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25" style={{ animationDuration: "2.5s", animationDelay: "1.6s" }} />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white text-base font-black shadow-md shadow-emerald-200">
                          C
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-12 top-1/2 -translate-y-1/2 z-50 w-56 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="rounded-2xl bg-gray-900 px-3.5 py-2.5 text-xs text-white shadow-xl">
                            <p className="font-semibold text-emerald-300 mb-0.5">C — Consequences</p>
                            <p className="text-white/80 leading-relaxed"><span className="text-white font-medium">Последствия</span> вашей реакции: что вы сделали, к чему это привело и какие выводы можно сделать.</p>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-gray-900 rotate-45" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1.5">
                        <span className="text-sm font-semibold text-black/80">Consequences — Последствия</span>
                      </div>
                      <textarea
                        rows={3}
                        value={editor.abcC}
                        onChange={(e) => editor.setAbcC(e.target.value)}
                        className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 text-[14px] text-black/80 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/50 transition-all resize-none"
                        placeholder="Что вы сделали? Как отреагировали? Что поняли? Что можно было сделать иначе?"
                      />
                      <p className="mt-1 text-[11px] text-black/40">Помогло ли ваше поведение? Что вынесли из этого?</p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* === ЕЖЕДНЕВНАЯ ФОРМА === */}
          {editor.noteType === "daily" && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
          <>
            <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                <Smile size={15} className="text-blue-600" />
                Настроение (1–10)
              </Label>
              <input
                type="number"
                min="1"
                max="10"
                value={editor.mood}
                onChange={(e) => editor.setMood(e.target.value)}
                placeholder="1–10"
                className="h-11 w-full rounded-xl border-0 bg-black/[0.06] px-4 text-[15px] text-black/80 outline-2 outline-offset-2 outline-blue-400 transition-all duration-250 focus:outline-offset-[5px] focus:bg-white focus:shadow-sm placeholder:text-black/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="text-xs text-black/50 leading-relaxed">
                <span className="inline-flex items-center gap-1"><Lightbulb size={13} className="text-blue-600" /> Оцени по самочувствию, не по событиям</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                <Moon size={15} className="text-emerald-600" />
                Сон (минуты)
              </Label>
              <input
                type="number"
                value={editor.sleep}
                onChange={(e) => editor.setSleep(e.target.value)}
                placeholder="минуты"
                className="h-11 w-full rounded-xl border-0 bg-black/[0.06] px-4 text-[15px] text-black/80 outline-2 outline-offset-2 outline-emerald-400 transition-all duration-250 focus:outline-offset-[5px] focus:bg-white focus:shadow-sm placeholder:text-black/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="text-xs text-black/50 leading-relaxed">
                <span className="inline-flex items-center gap-1"><Lightbulb size={13} className="text-blue-600" /> Например: 420 = 7 часов</span>
              </div>
            </div>
            </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
              <MessageSquare size={15} className="text-blue-600" />
              Комментарий
            </Label>
            <textarea
              rows={5}
              value={editor.comment}
              onChange={(e) => editor.setComment(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] text-black/80 outline-none
                         focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 transition-all resize-none shadow-sm"
              placeholder="Как прошёл день? Что было важного или интересного?"
            />
          </div>

          {/* EXPANDABLE: ДОПОЛНИТЕЛЬНО */}
          <div className="mt-6 pt-6 border-t border-black/10">
            <button
              type="button"
              onClick={() => editor.setShowAdvanced(!editor.showAdvanced)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal size={18} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-black/80">Дополнительные параметры</h3>
                <span className="rounded-lg bg-blue-100/70 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  Опционально
                </span>
              </div>
              <span className={`text-black/40 transition-transform ${editor.showAdvanced ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            <p className="mt-2 text-sm text-black/60">
              Помогает ИИ лучше понять ваше состояние и дать персонализированные рекомендации
            </p>

            {editor.showAdvanced && (
              <div className="mt-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Energy & Stress */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                      <Battery size={15} className="text-blue-600" />
                      Энергия (1–10)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={editor.energy}
                      onChange={(e) => editor.setEnergy(e.target.value)}
                      className="h-11"
                      placeholder="Уровень энергии"
                    />
                    <div className="text-xs text-black/50">Насколько бодро вы себя чувствуете</div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                      <Flame size={15} className="text-orange-600" />
                      Стресс (1–10)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={editor.stress}
                      onChange={(e) => editor.setStress(e.target.value)}
                      className="h-11"
                      placeholder="Уровень стресса"
                    />
                    <div className="text-xs text-black/50">Насколько напряжённо/тревожно</div>
                  </div>
                </div>

                {/* Activities */}
                <div className="rounded-2xl border border-black/10 bg-blue-50/20 p-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-black/80 mb-4">
                    <Zap size={15} className="text-blue-600" />
                    Активности дня
                  </h4>

                  <div className="grid gap-4">
                    <ActivityRating
                      icon={<Apple size={16} className="text-emerald-600" />}
                      label="Питание"
                      value={editor.nutrition}
                      onChange={editor.setNutrition}
                    />
                    <ActivityRating
                      icon={<Dumbbell size={16} className="text-blue-600" />}
                      label="Физ. активность"
                      value={editor.exercise}
                      onChange={editor.setExercise}
                    />
                    <ActivityRating
                      icon={<Gamepad2 size={16} className="text-blue-600" />}
                      label="Хобби/Развлечения"
                      value={editor.hobbies}
                      onChange={editor.setHobbies}
                    />
                    <ActivityRating
                      icon={<Users size={16} className="text-blue-600" />}
                      label="Общение"
                      value={editor.social}
                      onChange={editor.setSocial}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          </></motion.div>
          )}
          </AnimatePresence>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <Button className="w-full sm:w-auto text-base font-medium px-6 py-2.5 shadow-md hover:shadow-lg">
              {editor.editingId ? " Сохранить изменения" : " Сохранить запись"}
            </Button>
            <div className="text-xs text-black/50">
              Сохранение обновит историю и график
            </div>
          </div>
        </form>

        {/* MINI NOTES */}
          <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <StickyNote size={18} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-black">Мини-заметки</h3>
              </div>
              <p className="mt-1.5 text-sm text-black/65">
                Быстро записать мысль без настроения и сна
              </p>
            </div>
            <span className="rounded-full border border-blue-200/60 bg-blue-100/60 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
              {quickNotes.quickNotesCount} шт.
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Быстрая мысль или идея..."
              value={quickNotes.quickNote}
              onChange={(e) => quickNotes.setQuickNote(e.target.value)}
              className="flex-1 h-11"
            />
            <Button
              type="button"
              onClick={quickNotes.addQuickNote}
              className="w-full sm:w-auto px-5 shadow-sm"
            >
              <span className="inline-flex items-center gap-1.5"><Plus size={15} /> Добавить</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
