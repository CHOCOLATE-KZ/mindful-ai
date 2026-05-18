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
  ChevronDown,
} from "lucide-react";

/**
 * Компонент формы создания/редактирования заметки
 */
export default function NotesForm({ editor, quickNotes }) {
  const isABC = editor.noteType === "abc";

  return (
    <Card
      className={`relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl transition-all duration-500 ${
        isABC ? "bg-violet-50/40" : "bg-sky-50/40"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-[90px] transition-colors duration-700 ${
          isABC ? "bg-violet-200/40" : "bg-sky-200/40"
        }`}
      />
      <div
        className={`pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full blur-[90px] transition-colors duration-700 ${
          isABC ? "bg-pink-100/35" : "bg-teal-100/35"
        }`}
      />

      <div className="relative p-8 md:p-10 backdrop-blur-[2px]">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-11 w-11 place-items-center rounded-2xl ${
                  isABC ? "bg-violet-100 text-violet-600" : "bg-sky-100 text-sky-600"
                }`}
              >
                {isABC ? <AlertTriangle size={22} /> : <FileText size={22} />}
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                {editor.editingId ? "Редактировать" : "Как вы сегодня?"}
              </h2>
            </div>
            <p className="mt-3 text-base text-slate-600 leading-relaxed font-light max-w-2xl">
              {isABC
                ? "Разберите тревожную ситуацию по методике КПТ: триггер → реакция → последствия"
                : "Мягко зафиксируйте настроение, сон и мысли дня. Это помогает замечать паттерны и поддерживать ресурс."}
            </p>
          </div>

          {editor.editingId && (
            <button
              type="button"
              onClick={editor.resetEditor}
              className="group rounded-full border border-slate-200/60 bg-white/70 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-white transition-all shadow-sm"
            >
              <span className="inline-flex items-center gap-2">
                <RotateCcw size={15} className="transition-transform duration-500 group-hover:rotate-180" />
                Отмена
              </span>
            </button>
          )}
        </div>

        {/* Переключатель типа записи */}
        <div className="mb-8 flex p-1.5 gap-1 rounded-[1.25rem] bg-slate-200/50 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => editor.setNoteType("daily")}
            className={`flex flex-1 items-center justify-center gap-2.5 rounded-[1rem] py-3 text-sm font-bold transition-all duration-300 ${
              !isABC
                ? "bg-white text-slate-800 shadow-lg scale-[1.02]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CalendarDays size={18} className={!isABC ? "text-sky-600" : ""} />
            Ежедневная
          </button>
          <button
            type="button"
            onClick={() => editor.setNoteType("abc")}
            className={`flex flex-1 items-center justify-center gap-2.5 rounded-[1rem] py-3 text-sm font-bold transition-all duration-300 ${
              isABC
                ? "bg-white text-slate-800 shadow-lg scale-[1.02]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <AlertTriangle size={18} className={isABC ? "text-violet-600" : ""} />
            Разбор ситуации
          </button>
        </div>

        <form onSubmit={editor.saveNote} className="space-y-8">

          <AnimatePresence mode="wait">
          {/* === ABC ФОРМА === */}
          {isABC && (
            <motion.div
              key="abc"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Вертикальный степпер A → B → C */}
              <div className="space-y-6 relative before:absolute before:left-[23px] before:top-10 before:bottom-10 before:w-0.5 before:bg-gradient-to-b before:from-rose-200 before:via-amber-200 before:to-emerald-200">

                  {/* A — Триггер */}
                  <div className="flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500 font-bold text-white shadow-lg shadow-rose-200">A</div>
                    <div className="flex-1 space-y-2">
                      <div className="mb-1.5">
                        <Label className="text-slate-700 font-bold ml-1">Что случилось? (Trigger)</Label>
                      </div>
                      <textarea
                        value={editor.abcA}
                        onChange={(e) => editor.setAbcA(e.target.value)}
                        className="w-full min-h-[110px] rounded-[1.5rem] border-none bg-white/80 p-5 text-[15px] shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-rose-400 transition-all resize-none"
                        placeholder="Опишите событие..."
                      />
                    </div>
                  </div>

                  {/* B — Поведение/реакция */}
                  <div className="flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 font-bold text-white shadow-lg shadow-amber-100">B</div>
                    <div className="flex-1 space-y-2">
                      <div className="mb-1.5">
                        <Label className="text-slate-700 font-bold ml-1">Ваши мысли и чувства? (Beliefs)</Label>
                      </div>
                      <textarea
                        value={editor.abcB}
                        onChange={(e) => editor.setAbcB(e.target.value)}
                        className="w-full min-h-[110px] rounded-[1.5rem] border-none bg-white/80 p-5 text-[15px] shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-400 transition-all resize-none"
                        placeholder="Что промелькнуло в голове?"
                      />
                    </div>
                  </div>

                  {/* C — Последствия */}
                  <div className="flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-100">C</div>
                    <div className="flex-1 space-y-2">
                      <div className="mb-1.5">
                        <Label className="text-slate-700 font-bold ml-1">К чему это привело? (Consequences)</Label>
                      </div>
                      <textarea
                        value={editor.abcC}
                        onChange={(e) => editor.setAbcC(e.target.value)}
                        className="w-full min-h-[110px] rounded-[1.5rem] border-none bg-white/80 p-5 text-[15px] shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 transition-all resize-none"
                        placeholder="Что вы сделали в итоге?"
                      />
                    </div>
                  </div>

              </div>
            </motion.div>
          )}

          {/* === ЕЖЕДНЕВНАЯ ФОРМА === */}
          {!isABC && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="group relative rounded-[2rem] bg-white/65 p-6 shadow-sm hover:shadow-md transition-all">
                  <Label className="flex items-center gap-3 text-slate-600 font-bold mb-4 ml-1">
                    <Smile className="text-sky-500" /> Настроение (1-10)
                  </Label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editor.mood}
                    onChange={(e) => editor.setMood(e.target.value)}
                    className="w-full bg-transparent text-4xl font-black text-sky-600 outline-none placeholder:text-sky-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="8"
                  />
                  <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                    <span className="inline-flex items-center gap-1"><Lightbulb size={13} className="text-sky-500" /> Оцени по самочувствию</span>
                  </div>
                </div>

                <div className="group relative rounded-[2rem] bg-white/65 p-6 shadow-sm hover:shadow-md transition-all">
                  <Label className="flex items-center gap-3 text-slate-600 font-bold mb-4 ml-1">
                    <Moon className="text-indigo-500" /> Сон (минуты)
                  </Label>
                  <input
                    type="number"
                    value={editor.sleep}
                    onChange={(e) => editor.setSleep(e.target.value)}
                    className="w-full bg-transparent text-4xl font-black text-indigo-600 outline-none placeholder:text-indigo-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="480"
                  />
                  <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                    <span className="inline-flex items-center gap-1"><Lightbulb size={13} className="text-indigo-500" /> Например: 420 = 7 часов</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-3 text-slate-600 font-bold ml-1">
                  <MessageSquare size={18} className="text-sky-500" /> О чем вы думаете?
                </Label>
                <textarea
                  rows={6}
                  value={editor.comment}
                  onChange={(e) => editor.setComment(e.target.value)}
                  className="w-full rounded-[2rem] border-none bg-white/80 p-6 text-[16px] shadow-sm ring-1 ring-slate-100 focus:ring-4 focus:ring-sky-100 transition-all resize-none"
                  placeholder="Напишите всё, что на душе..."
                />
              </div>

              {/* EXPANDABLE: ДОПОЛНИТЕЛЬНО */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => editor.setShowAdvanced(!editor.showAdvanced)}
                  className="flex items-center justify-between w-full p-5 rounded-[1.5rem] bg-slate-100/55 hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3 font-bold text-slate-700">
                    <SlidersHorizontal size={20} className="text-slate-500 group-hover:text-sky-500 transition-colors" />
                    Детали дня
                  </div>
                  <ChevronDown className={`transition-transform duration-300 ${editor.showAdvanced ? "rotate-180" : ""}`} />
                </button>

                {editor.showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-6 grid gap-6"
                  >
                    {/* Energy & Stress */}
                    <div className="grid gap-6 sm:grid-cols-2 bg-white/40 p-8 rounded-[2rem]">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-600 flex items-center gap-2">
                          <Battery size={16} /> Энергия
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={editor.energy}
                          onChange={(e) => editor.setEnergy(e.target.value)}
                          className="rounded-2xl border-none shadow-sm h-12"
                          placeholder="1-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-600 flex items-center gap-2">
                          <Flame size={16} /> Стресс
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={editor.stress}
                          onChange={(e) => editor.setStress(e.target.value)}
                          className="rounded-2xl border-none shadow-sm h-12"
                          placeholder="1-10"
                        />
                      </div>
                    </div>

                    {/* Activities */}
                    <div className="p-8 bg-white/40 rounded-[2rem] space-y-4">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Zap size={16} className="text-sky-500" />
                        Активности дня
                      </h4>
                      <ActivityRating
                        icon={<Apple className="text-emerald-500" />}
                        label="Питание"
                        value={editor.nutrition}
                        onChange={editor.setNutrition}
                      />
                      <ActivityRating
                        icon={<Dumbbell className="text-sky-500" />}
                        label="Физ. активность"
                        value={editor.exercise}
                        onChange={editor.setExercise}
                      />
                      <ActivityRating
                        icon={<Gamepad2 className="text-indigo-500" />}
                        label="Хобби/Развлечения"
                        value={editor.hobbies}
                        onChange={editor.setHobbies}
                      />
                      <ActivityRating
                        icon={<Users className="text-orange-500" />}
                        label="Общение"
                        value={editor.social}
                        onChange={editor.setSocial}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          <Button
            className={`w-full py-7 rounded-[2rem] text-lg font-bold shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98] ${
              isABC ? "bg-violet-600 hover:bg-violet-700" : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {editor.editingId ? "Обновить историю" : "Сохранить день"}
          </Button>
        </form>

        {/* MINI NOTES */}
        <div className="mt-12 p-8 rounded-[2.5rem] bg-amber-50/55 border border-amber-100/50 shadow-inner">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <StickyNote className="text-amber-500" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Быстрые мысли</h3>
            </div>
            <span className="rounded-full border border-amber-200/60 bg-amber-100/80 px-3.5 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
              {quickNotes.quickNotesCount} шт.
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Что-то важное..."
              value={quickNotes.quickNote}
              onChange={(e) => quickNotes.setQuickNote(e.target.value)}
              className="flex-1 rounded-2xl border-none shadow-md h-14 px-6"
            />
            <button
              type="button"
              onClick={quickNotes.addQuickNote}
              className="p-4 rounded-2xl bg-amber-400 text-white shadow-lg hover:bg-amber-500 transition-all hover:rotate-3"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
