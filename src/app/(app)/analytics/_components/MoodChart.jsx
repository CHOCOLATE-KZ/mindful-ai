import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

export default function MoodChart({ series30 }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6">
      <h3 className="text-xl font-semibold mb-4">Трекер настроения (30 дней)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={series30}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2} name="Настроение" />
          <Line type="monotone" dataKey="sleep" stroke="#10B981" strokeWidth={2} name="Сон (мин)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
