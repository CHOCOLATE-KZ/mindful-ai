import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-lg p-2 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
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
    <div className="h-full rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Динамика состояния</h3>
        <button className="rounded-full bg-[#d9eeea] px-3 py-1 text-xs font-semibold text-[#2a4842]">Экспорт</button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={series30}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde5ee" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line type="monotone" dataKey="mood" stroke="#74AA9C" strokeWidth={2.5} dot={false} name="Настроение" />
          <Line type="monotone" dataKey="sleep" stroke="#5d9088" strokeWidth={2.5} dot={false} name="Сон (мин)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
