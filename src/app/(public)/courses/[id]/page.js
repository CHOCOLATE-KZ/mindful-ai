"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CoursePage({ params }) {
  const { id } = params;
  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch("/courses/course-data.json")
      .then(res => res.json())
      .then(data => {
        const found = data.find(c => c.id === id);
        if (!found) router.push("/courses");
        setCourse(found);
      });
  }, [id, router]);

  if (!course) return <div className="p-8">Загрузка...</div>;

  const activeCourseModule = course.modules[activeModule];
  const lesson = activeCourseModule.lessons[activeLesson];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-slate-50 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-700">{course.title}</h2>
        <div className="mb-6 text-sm text-blue-900">{course.description}</div>
        <nav>
          {course.modules.map((mod, mIdx) => (
            <div key={mod.title} className="mb-4">
              <div className="font-semibold text-blue-600 mb-2">{mod.title}</div>
              <ul>
                {mod.lessons.map((les, lIdx) => (
                  <li key={les.title}>
                    <button
                      className={`w-full text-left px-2 py-1 rounded transition-colors ${
                        mIdx === activeModule && lIdx === activeLesson
                          ? "bg-blue-200 text-blue-900 font-bold"
                          : "hover:bg-blue-100 text-blue-700"
                      }`}
                      onClick={() => {
                        setActiveModule(mIdx);
                        setActiveLesson(lIdx);
                      }}
                    >
                      {les.type === "video" && "🎬 "}
                      {les.type === "quiz" && "📝 "}
                      {les.type === "practice" && "🧘 "}
                      {les.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-10">
        <h3 className="text-2xl font-bold mb-4 text-blue-700">{lesson.title}</h3>
        {lesson.type === "video" && (
          <video src={lesson.src} controls className="w-full max-w-2xl mb-6 rounded shadow" />
        )}
        {lesson.type === "quiz" && (
          <div className="mb-6">
            <div className="mb-2 font-semibold">Вопросы:</div>
            {lesson.questions.map((q, idx) => (
              <div key={idx} className="mb-3">
                <div>{q.q}</div>
                {q.a.map((ans, aIdx) => (
                  <label key={aIdx} className="block">
                    <input type="radio" name={`q${idx}`} className="mr-2" />
                    {ans}
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
        {lesson.type === "practice" && (
          <div className="mb-6">
            <div className="font-semibold mb-2">Инструкция:</div>
            <div>{lesson.instructions}</div>
          </div>
        )}
        {/* Навигация по урокам */}
        <div className="flex gap-4 mt-8">
          <button
            className="px-4 py-2 rounded bg-slate-200 text-slate-700 disabled:opacity-50"
            onClick={() => {
              if (activeLesson > 0) setActiveLesson(activeLesson - 1);
              else if (activeModule > 0) {
                setActiveModule(activeModule - 1);
                setActiveLesson(course.modules[activeModule - 1].lessons.length - 1);
              }
            }}
            disabled={activeModule === 0 && activeLesson === 0}
          >
            Назад
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={() => {
              if (activeLesson < activeCourseModule.lessons.length - 1) setActiveLesson(activeLesson + 1);
              else if (activeModule < course.modules.length - 1) {
                setActiveModule(activeModule + 1);
                setActiveLesson(0);
              }
            }}
            disabled={
              activeModule === course.modules.length - 1 &&
              activeLesson === activeCourseModule.lessons.length - 1
            }
          >
            Далее
          </button>
        </div>
      </main>
    </div>
  );
}
