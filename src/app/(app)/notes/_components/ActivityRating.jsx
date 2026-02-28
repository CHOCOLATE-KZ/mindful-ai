/**
 * Компонент для выбора рейтинга активности
 */
export default function ActivityRating({ icon, label, value, onChange }) {
  const options = [
    { val: "great", label: "Отлично", emoji: "⭐", color: "emerald" },
    { val: "fine", label: "Хорошо", emoji: "✓", color: "blue" },
    { val: "ok", label: "OK", emoji: "○", color: "yellow" },
    { val: "poor", label: "Плохо", emoji: "✗", color: "red" },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 min-w-[140px]">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-black/70">{label}</span>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(value === opt.val ? "" : opt.val)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${value === opt.val
                ? `bg-${opt.color}-100 text-${opt.color}-700 border-${opt.color}-300 shadow-sm scale-105`
                : 'bg-white/80 text-black/50 border-black/10 hover:bg-black/[0.04]'
              }
              border
            `}
            style={value === opt.val ? {
              backgroundColor: opt.color === 'emerald' ? '#d1fae5' : 
                               opt.color === 'blue' ? '#dbeafe' :
                               opt.color === 'yellow' ? '#fef3c7' : '#fee2e2',
              color: opt.color === 'emerald' ? '#047857' :
                     opt.color === 'blue' ? '#1d4ed8' :
                     opt.color === 'yellow' ? '#b45309' : '#dc2626',
              borderColor: opt.color === 'emerald' ? '#6ee7b7' :
                          opt.color === 'blue' ? '#93c5fd' :
                          opt.color === 'yellow' ? '#fcd34d' : '#fca5a5',
            } : {}}
          >
            <span className="mr-1">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
