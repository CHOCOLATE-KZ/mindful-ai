/**
 * Компонент для выбора рейтинга активности
 */
export default function ActivityRating({ icon, label, value, onChange }) {
  const options = [
    {
      val: "great",
      label: "Отлично",
      emoji: "●",
      activeStyle: {
        backgroundColor: "#d1fae5",
        color: "#047857",
        borderColor: "#6ee7b7",
      },
    },
    {
      val: "fine",
      label: "Хорошо",
      emoji: "◉",
      activeStyle: {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
        borderColor: "#93c5fd",
      },
    },
    {
      val: "ok",
      label: "OK",
      emoji: "○",
      activeStyle: {
        backgroundColor: "#fef3c7",
        color: "#b45309",
        borderColor: "#fcd34d",
      },
    },
    {
      val: "poor",
      label: "Плохо",
      emoji: "◌",
      activeStyle: {
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        borderColor: "#fca5a5",
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 min-w-[150px]">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(value === opt.val ? "" : opt.val)}
            className={`
              px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border
              ${value === opt.val
                ? "shadow-sm scale-105"
                : "bg-white/85 text-slate-500 border-slate-200 hover:bg-white hover:text-slate-700"
              }
            `}
            style={value === opt.val ? opt.activeStyle : undefined}
          >
            <span className="mr-1">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
