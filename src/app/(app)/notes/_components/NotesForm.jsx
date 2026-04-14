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
              Заполните настроение и сон (по желанию) и добавьте комментарий.
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

        <form onSubmit={editor.saveNote} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-black/70">
                <Smile size={15} className="text-blue-600" />
                Настроение (1–10)
              </Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={editor.mood}
                onChange={(e) => editor.setMood(e.target.value)}
                className="h-11"
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
              <Input
                type="number"
                value={editor.sleep}
                onChange={(e) => editor.setSleep(e.target.value)}
                className="h-11"
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <Button className="w-full sm:w-auto text-base font-medium px-6 py-2.5 shadow-md hover:shadow-lg">
              {editor.editingId ? " Сохранить изменения" : " Сохранить запись"}
            </Button>
            <div className="text-xs text-black/50">
              Сохранение обновит историю и график
            </div>
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
        </form>

        {/* MINI NOTES */}
          <div className="mt-8 rounded-3xl border border-dashed border-black/15 bg-blue-50/50 p-6 shadow-sm">
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
