import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { COLORS } from "../_data/analyticsData";

export default function TestCharts({ testAnalytics }) {
  return (
    <>
      {/* График попыток по дням */}
      <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
        <h3 className="text-xl font-semibold mb-6 text-slate-900">Активность по дням</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={testAnalytics.dailyChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="attempts"
              stroke="#74AA9C"
              strokeWidth={2}
              dot={{ fill: "#74AA9C", r: 5 }}
              name="Попыток"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Популярные ответы */}
      <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
        <h3 className="text-xl font-semibold mb-6 text-slate-900">Выбранные ответы (топ 10)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={testAnalytics.answerStats.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="answer"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#74AA9C" name="Количество" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Распределение ответов (круговая диаграмма) */}
      {testAnalytics.answerStats.length > 0 && (
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
          <h3 className="text-xl font-semibold mb-6">
            Распределение ответов (все {testAnalytics.answerStats.length} вариантов)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={testAnalytics.answerStats}
                dataKey="count"
                nameKey="answer"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {testAnalytics.answerStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
