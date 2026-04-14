import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[rgb(42_42_58)] shadow-lg text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.stroke }} className="text-xs">
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function MoodChart({ series30 }) {
  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/[0.08] bg-white/70 dark:bg-[rgb(42_42_58)]/80 backdrop-blur-xl p-6">
      <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Трекер настроения (30 дней)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={series30}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-black/[0.07] dark:text-white/[0.08]" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-500 dark:text-slate-400" />
          <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-500 dark:text-slate-400" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2.5} dot={false} name="Настроение" />
          <Line type="monotone" dataKey="sleep" stroke="#10B981" strokeWidth={2.5} dot={false} name="Сон (мин)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
